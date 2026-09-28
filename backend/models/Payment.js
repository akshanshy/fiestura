import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Razorpay identifiers
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },

    // Who paid & for what
    userId: {
      type: String,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
    },

    // Amount in INR (human-readable, NOT paise)
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "INR",
    },

    // Payment lifecycle
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },

    receipt: {
      type: String,
    },

    // Idempotency Key to prevent duplicate payment order creation
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
