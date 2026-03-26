import express from "express";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

const router = express.Router();


// ➕ Register for event
router.post("/", async (req, res) => {
  try {
    const { userId, eventId, name, email } = req.body;

    const existing = await Registration.findOne({ userId, eventId });
    if (existing) {
      return res.status(400).json("Already registered");
    }

    const reg = await Registration.create({
      userId,
      eventId,
      name,
      email
    });

    res.json(reg);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 👤 User registrations
router.get("/user/:userId", async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.params.userId });

    const result = await Promise.all(
      regs.map(async (r) => {
        const event = await Event.findById(r.eventId);
        return { ...r._doc, event };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🧑‍💼 Admin: all registrations
router.get("/", async (req, res) => {
  try {
    const regs = await Registration.find();

    const result = await Promise.all(
      regs.map(async (r) => {
        const event = await Event.findById(r.eventId);
        return { ...r._doc, event };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json(err.message);
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