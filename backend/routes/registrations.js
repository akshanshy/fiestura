import express from "express";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";
const router = express.Router();


// ➕ Register for event
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { userId, eventId, name, email } = req.body;

    session.startTransaction();

    // 1. Check whether user already registered
    const existing = await Registration.findOne({
      userId,
      eventId
    }).session(session);

    if (existing) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Already registered"
      });
    }

    // 2. reserve a seat
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: {
          $lt: ["$registeredCount", "$capacity"]
        }
      },
      {
        $inc: {
          registeredCount: 1
        }
      },
      {
        new: true,
        session
      }
    );

    if (!event) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Event is full"
      });
    }

    // 3. Create registration
    const registration = await Registration.create(
      [
        {
          userId,
          eventId,
          name,
          email
        }
      ],
      { session }
    );

    // 4. Everything succeeded
    await session.commitTransaction();

    res.status(201).json(registration[0]);

  } catch (err) {

    // Undo all database changes
    await session.abortTransaction();

    // Duplicate registration
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Already registered"
      });
    }

    res.status(500).json({
      message: err.message
    });

  } finally {
    await session.endSession();
  }
});


//  User registrations
router.get("/user/:userId", async (req, res) => {
  try {
    const registrations = await Registration.aggregate([
      {
        $match: {
          userId: req.params.userId
        }
      },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: {
          path: "$event",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    res.json(registrations);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});


// 🧑‍💼 Admin: all registrations
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: {
          path: "$event",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    res.json(registrations);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});


// ❌ Cancel registration
router.delete("/", async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const deleted = await Registration.findOneAndDelete({
      userId,
      eventId
    });

    if (!deleted) {
      return res.status(404).json("Registration not found");
    }

    res.json("Registration cancelled ✅");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

export default router;