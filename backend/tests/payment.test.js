
import request from "supertest";
import app from "../app.js";

describe("POST /api/payment/create-order", () => {
  test("should reject a request with missing required fields", async () => {
    const response = await request(app)
      .post("/api/payment/create-order")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "amount, userId, and eventId are required",
    });
  });
});
