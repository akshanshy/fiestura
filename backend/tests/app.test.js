import request from "supertest";
import { jest } from "@jest/globals";
import app from "../app.js";

describe("Fiestura API", () => {
  test("GET / should return backend working message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Backend working ✅");
  });
});