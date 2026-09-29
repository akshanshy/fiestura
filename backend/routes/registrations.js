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


// 🧑‍💼 Admin: registrations with server-side pagination & optional eventId filter
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    let limit = parseInt(req.query.limit, 10) || 20;
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    const matchStage = {};
    if (req.query.eventId && req.query.eventId.trim() !== "") {
      if (mongoose.Types.ObjectId.isValid(req.query.eventId)) {
        matchStage.eventId = new mongoose.Types.ObjectId(req.query.eventId);
      } else {
        matchStage.eventId = req.query.eventId;
      }
    }

    const basePipeline = [];

    if (Object.keys(matchStage).length > 0) {
      basePipeline.push({ $match: matchStage });
    }

    // Newest registrations first
    basePipeline.push({ $sort: { createdAt: -1 } });

    // Lookup event details
    basePipeline.push({
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event"
      }
    });

    basePipeline.push({
      $unwind: {
        path: "$event",
        preserveNullAndEmptyArrays: true
      }
    });

    // Count total matching registrations before skip & limit
    const countPipeline = [...basePipeline, { $count: "total" }];
    const countResult = await Registration.aggregate(countPipeline);
    const totalRegistrations = countResult.length > 0 ? countResult[0].total : 0;

    // Apply pagination skip & limit
    const dataPipeline = [...basePipeline, { $skip: skip }, { $limit: limit }];
    const registrations = await Registration.aggregate(dataPipeline);

    const totalPages = Math.ceil(totalRegistrations / limit) || (totalRegistrations === 0 ? 0 : 1);

    res.json({
      registrations,
      pagination: {
        page,
        limit,
        totalRegistrations,
        totalPages
      }
    });

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