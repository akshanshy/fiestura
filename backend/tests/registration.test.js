
import { jest } from "@jest/globals";

import mongoose from "mongoose";

const mockStartSession = jest.spyOn(mongoose, "startSession");

const mockFindOne = jest.fn();
const mockEventFindOneAndUpdate = jest.fn();
const mockRegistrationCreate = jest.fn();

jest.unstable_mockModule("../models/Registration.js", () => ({
  default: {
    findOne: mockFindOne,
    create: mockRegistrationCreate,
    aggregate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/Event.js", () => ({
  default: {
    findOneAndUpdate: jest.fn(),
  },
}));



const { default: app } = await import("../app.js");
const request = (await import("supertest")).default;

describe("POST /registrations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should reject a duplicate registration", async () => {
    
const mockAbortTransaction = jest.fn().mockResolvedValue(undefined);
const mockEndSession = jest.fn().mockResolvedValue(undefined);
const mockStartTransaction = jest.fn();

mockStartSession.mockResolvedValue({
  startTransaction: mockStartTransaction,
  abortTransaction: mockAbortTransaction,
  endSession: mockEndSession,
  commitTransaction: jest.fn(),
});


    mockFindOne.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        userId: "user_test123",
        eventId: "507f1f77bcf86cd799439011",
      }),
    });

    const response = await request(app)
      .post("/registrations")
      .send({
        userId: "user_test123",
        eventId: "507f1f77bcf86cd799439011",
        name: "Test User",
        email: "test@example.com",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Already registered");
    expect(mockAbortTransaction).toHaveBeenCalledTimes(1);
  });
  test("should reject registration when event is full", async () => {
  const mockAbortTransaction = jest.fn().mockResolvedValue(undefined);
  const mockEndSession = jest.fn().mockResolvedValue(undefined);
  const mockStartTransaction = jest.fn();
  const mockCommitTransaction = jest.fn();

  mockStartSession.mockResolvedValue({
    startTransaction: mockStartTransaction,
    abortTransaction: mockAbortTransaction,
    endSession: mockEndSession,
    commitTransaction: mockCommitTransaction,
  });

  // The user has not registered yet.
  mockFindOne.mockReturnValue({
    session: jest.fn().mockResolvedValue(null),
  });

  // No event matches the condition that capacity is available.
  mockEventFindOneAndUpdate.mockResolvedValue(null);

  const response = await request(app)
    .post("/registrations")
    .send({
      userId: "user_test456",
      eventId: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Event is full");

  // No registration should be created.
  expect(mockRegistrationCreate).not.toHaveBeenCalled();

  // The failed operation should abort, not commit.
  expect(mockAbortTransaction).toHaveBeenCalledTimes(1);
  expect(mockCommitTransaction).not.toHaveBeenCalled();
  expect(mockEndSession).toHaveBeenCalledTimes(1);
});
});
