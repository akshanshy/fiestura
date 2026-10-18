
import { jest } from "@jest/globals";

const mockFindOne = jest.fn();
const mockFindOneAndUpdate = jest.fn();

jest.unstable_mockModule("../models/Payment.js", () => ({
  default: {
    findOne: mockFindOne,
    findOneAndUpdate: mockFindOneAndUpdate,
    create: jest.fn(),
  },
}));

const mockRegistrationFindOne = jest.fn();
const mockRegistrationCreate = jest.fn();
const mockEventFindByIdAndUpdate = jest.fn();
const mockUserFindById = jest.fn();

jest.unstable_mockModule("../models/Registration.js", () => ({
  default: {
    findOne: mockRegistrationFindOne,
    create: mockRegistrationCreate,
  },
}));

jest.unstable_mockModule("../models/Event.js", () => ({
  default: {
    findByIdAndUpdate: mockEventFindByIdAndUpdate,
  },
}));

jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    findById: mockUserFindById,
  },
}));

const { default: app } = await import("../app.js");
const request = (await import("supertest")).default;

describe("POST /api/payment/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAZORPAY_WEBHOOK_SECRET = "test-webhook-secret";
  });
  
test("should not register the user again when payment is already paid", async () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = "";

  mockFindOne.mockResolvedValue({
    status: "paid",
    userId: "user_test123",
    eventId: "event_test123",
    razorpayOrderId: "order_test123",
    razorpayPaymentId: "pay_test123",
    save: jest.fn(),
  });

  const response = await request(app)
    .post("/api/payment/webhook")
    .send({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test123",
            order_id: "order_test123",
          },
        },
      },
    });

  expect(response.status).toBe(200);
  expect(mockRegistrationFindOne).not.toHaveBeenCalled();
  expect(mockRegistrationCreate).not.toHaveBeenCalled();
  expect(mockEventFindByIdAndUpdate).not.toHaveBeenCalled();
});

  test("should reject an invalid webhook signature", async () => {
    const response = await request(app)
      .post("/api/payment/webhook")
      .set("x-razorpay-signature", "invalid-signature")
      .send({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test123",
              order_id: "order_test123",
            },
          },
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Webhook signature verification failed"
    );

    expect(mockFindOne).not.toHaveBeenCalled();
  });
});
