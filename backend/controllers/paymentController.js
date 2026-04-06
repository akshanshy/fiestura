import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../models/Payment.js";

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
//    Creates a Razorpay order and saves it in the DB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const createOrder = async (req, res) => {
  try {
    const { amount, userId, eventId } = req.body;

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

    // ── Check for duplicate payment ──
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

    // ── Create Razorpay order ──
    const receipt = `rcpt_${eventId.slice(-6)}_${Date.now()}`;

    const order = await getRazorpay().orders.create({
      amount: Math.round(amount * 100), // convert ₹ → paise
      currency: "INR",
      receipt,
    });

    // ── Persist in DB ──
    await Payment.create({
      razorpayOrderId: order.id,
      userId,
      eventId,
      amount,
      currency: "INR",
      receipt,
      status: "created",
    });

    // ── Respond with everything the frontend needs ──
    return res.status(201).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID, // frontend needs this to open checkout
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