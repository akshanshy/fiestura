import express from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getUserPayments,
} from "../controllers/paymentController.js";

const router = express.Router();

// POST  /api/payment/create-order   → Create a Razorpay order
router.post("/create-order", createOrder);

// POST  /api/payment/verify         → Verify payment signature
router.post("/verify", verifyPayment);

// GET   /api/payment/status/:orderId → Check payment status
router.get("/status/:orderId", getPaymentStatus);

// GET   /api/payment/user/:userId    → User's payment history
router.get("/user/:userId", getUserPayments);

export default router;