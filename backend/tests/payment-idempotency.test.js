
import { jest } from "@jest/globals";

const mockFindOne = jest.fn();
const mockOrdersCreate = jest.fn();

jest.unstable_mockModule("../models/Payment.js", () => ({
  default: {
    findOne: mockFindOne,
    create: jest.fn(),
  },
}));

jest.unstable_mockModule("razorpay", () => ({
  default: class Razorpay {
    constructor() {
      this.orders = {
        create: mockOrdersCreate,
      };
    }
  },
}));

const { default: app } = await import("../app.js");

import request from "supertest";

describe("Payment idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("reuses an existing order for the same idempotency key", async () => {
    mockFindOne.mockResolvedValue({
      status: "created",
      razorpayOrderId: "order_test123",
      amount: 100,
      currency: "INR",
    });

    const response = await request(app)
      .post("/api/payment/create-order")
      .set("x-idempotency-key", "test-key-123")
      .send({
        amount: 100,
        userId: "user_test123",
        eventId: "event_test123",
      });

    expect(response.status).toBe(200);
    expect(response.body.isIdempotentResponse).toBe(true);
    expect(response.body.order.id).toBe("order_test123");

    expect(mockOrdersCreate).not.toHaveBeenCalled();
  });
});
