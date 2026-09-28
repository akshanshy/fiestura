import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

// ─── Razorpay instance (lazy-initialized after env vars are loaded) ───
let razorpay;
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. CREATE ORDER  —  POST /api/payment/create-order
//    Creates a Razorpay order and saves it in the DB (with Idempotency Support)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const createOrder = async (req, res) => {
  try {
    const { amount, userId, eventId } = req.body;
    const idempotencyKey =
      req.headers["x-idempotency-key"] || req.body.idempotencyKey;

    // ── Validation ──
    if (!amount || !userId || !eventId) {
      return res.status(400).json({
        success: false,
        message: "amount, userId, and eventId are required",
      });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be a positive number (in INR)",
      });
    }

    // ── 1. Idempotency Check: if key provided, check for existing request ──
    if (idempotencyKey) {
      const existingPayment = await Payment.findOne({ idempotencyKey });
      if (existingPayment) {
        console.log(`🔁 Idempotent request detected for key: ${idempotencyKey}`);
        if (existingPayment.status === "created") {
          return res.status(200).json({
            success: true,
            isIdempotentResponse: true,
            order: {
              id: existingPayment.razorpayOrderId,
              amount: Math.round(existingPayment.amount * 100),
              currency: existingPayment.currency,
            },
            key: process.env.RAZORPAY_KEY_ID,
          });
        }
        if (existingPayment.status === "paid") {
          return res.status(200).json({
            success: true,
            isIdempotentResponse: true,
            message: "Payment already completed for this transaction",
            payment: {
              id: existingPayment.razorpayPaymentId,
              orderId: existingPayment.razorpayOrderId,
              amount: existingPayment.amount,
              status: existingPayment.status,
            },
          });
        }
      }
    }

    // ── 2. Check for duplicate payment by user for event ──
    const existingPaid = await Payment.findOne({
      userId,
      eventId,
      status: "paid",
    });

    if (existingPaid) {
      return res.status(409).json({
        success: false,
        message: "You have already paid for this event",
      });
    }

    // ── 3. Create Razorpay order ──
    const receipt = `rcpt_${eventId.slice(-6)}_${Date.now()}`;

    const order = await getRazorpay().orders.create({
      amount: Math.round(amount * 100), // convert ₹ → paise
      currency: "INR",
      receipt,
      notes: {
        userId,
        eventId,
        idempotencyKey: idempotencyKey || "",
      },
    });

    // ── 4. Persist in DB ──
    await Payment.create({
      razorpayOrderId: order.id,
      userId,
      eventId,
      amount,
      currency: "INR",
      receipt,
      idempotencyKey: idempotencyKey || null,
      status: "created",
    });

    // ── 5. Respond with frontend payload ──
    return res.status(201).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not create order. Please try again.",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. VERIFY PAYMENT  —  POST /api/payment/verify
//    Validates Razorpay signature & marks payment as "paid"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ── Validation ──
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    // ── Signature check (HMAC-SHA256) ──
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark as failed in DB
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );

      return res.status(400).json({
        success: false,
        message: "Payment verification failed — signature mismatch",
      });
    }

    // ── Update payment record ──
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Order not found in the database",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully ✅",
      payment: {
        id: payment.razorpayPaymentId,
        orderId: payment.razorpayOrderId,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (err) {
    console.error("❌ verifyPayment error:", err);
    return res.status(500).json({
      success: false,
      message: "Payment verification encountered an error",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. GET PAYMENT STATUS  —  GET /api/payment/status/:orderId
//    Fetches payment status from the DB for a given Razorpay order
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment: {
        orderId: payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        eventId: payment.eventId,
        createdAt: payment.createdAt,
      },
    });
  } catch (err) {
    console.error("❌ getPaymentStatus error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not fetch payment status",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. USER PAYMENT HISTORY  —  GET /api/payment/user/:userId
//    Returns all payments for a specific user
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments: payments.map((p) => ({
        orderId: p.razorpayOrderId,
        paymentId: p.razorpayPaymentId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        eventId: p.eventId,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    console.error("❌ getUserPayments error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not fetch payment history",
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. RAZORPAY WEBHOOK HANDLER  —  POST /api/payment/webhook
//    Receives Razorpay events (e.g. payment.captured, order.paid, payment.failed)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (webhookSecret) {
      if (!signature) {
        return res
          .status(400)
          .json({ success: false, message: "Missing webhook signature" });
      }

      // Use rawBody buffer captured in express.json verify hook
      const bodyPayload = req.rawBody
        ? req.rawBody.toString()
        : JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyPayload)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("❌ Webhook signature verification failed!");
        return res.status(400).json({
          success: false,
          message: "Webhook signature verification failed",
        });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`🔔 Received Razorpay Webhook Event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload?.payment?.entity;
      const orderEntity = payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const payment = await Payment.findOne({ razorpayOrderId });
        if (payment) {
          // Idempotent webhook check: only update if not already marked as paid
          if (payment.status !== "paid") {
            payment.status = "paid";
            if (razorpayPaymentId) {
              payment.razorpayPaymentId = razorpayPaymentId;
            }
            await payment.save();
            console.log(`✅ Payment ${razorpayOrderId} marked as paid via webhook`);

            // Auto-register user for event
            try {
              const existingRegistration = await Registration.findOne({
                userId: payment.userId,
                eventId: payment.eventId,
              });

              if (!existingRegistration) {
                const user = await User.findById(payment.userId);
                await Registration.create({
                  userId: payment.userId,
                  eventId: payment.eventId,
                  name: user?.name || "Attendee",
                  email: user?.email || "",
                });

                await Event.findByIdAndUpdate(payment.eventId, {
                  $inc: { registeredCount: 1 },
                });

                console.log(
                  `🎉 Webhook auto-registered user ${payment.userId} for event ${payment.eventId}`
                );
              }
            } catch (regErr) {
              console.error("⚠️ Error auto-registering user via webhook:", regErr);
            }
          }
        }
      }
    } else if (event === "payment.failed") {
      const razorpayOrderId = payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId, status: { $ne: "paid" } },
          { status: "failed" }
        );
        console.log(`❌ Payment ${razorpayOrderId} marked as failed via webhook`);
      }
    }

    // Always respond 200 OK to Razorpay webhook calls
    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ handleWebhook error:", err);
    return res.status(500).json({
      success: false,
      message: "Webhook processing error",
    });
  }
};