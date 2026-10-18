
import { jest } from "@jest/globals";

import crypto from "node:crypto";

const mockFindOneAndUpdate = jest.fn();

jest.unstable_mockModule("../models/Payment.js", () => ({
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: mockFindOneAndUpdate,
    create: jest.fn(),
  },
}));

const { default: app } = await import("../app.js");
const request = (await import("supertest")).default;

describe("POST /api/payment/verify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAZORPAY_KEY_SECRET = "test-secret";
  });
 
test("should return 404 when the order is not found", async () => {
  const orderId = "order_unknown123";
  const paymentId = "pay_unknown123";

  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  mockFindOneAndUpdate.mockResolvedValue(null);

  const response = await request(app)
    .post("/api/payment/verify")
    .send({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });

  expect(response.status).toBe(404);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe(
    "Order not found in the database"
  );
});
 
test("should accept a valid payment signature", async () => {
  const orderId = "order_test456";
  const paymentId = "pay_test456";

  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  mockFindOneAndUpdate.mockResolvedValue({
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    amount: 100,
    status: "paid",
  });

  const response = await request(app)
    .post("/api/payment/verify")
    .send({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.payment.status).toBe("paid");

  expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
    { razorpayOrderId: orderId },
    {
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      status: "paid",
    },
    { new: true }
  );
});

  test("should reject an invalid payment signature", async () => {
    mockFindOneAndUpdate.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/payment/verify")
      .send({
        razorpay_order_id: "order_test123",
        razorpay_payment_id: "pay_test123",
        razorpay_signature: "invalid-signature",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      "signature mismatch"
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { razorpayOrderId: "order_test123" },
      { status: "failed" }
    );
  });
});
