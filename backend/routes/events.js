import express from "express";
import Event from "../models/Event.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();


// ➕ CREATE EVENT
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  console.log("Received event:", req.body);
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      category,
      location,
      image,
      price
    } = req.body;

    // validation
    if (!title || !description || !startDate || !endDate || !category) {
      return res.status(400).json({
        message: "Title, description, start date, end date and category are required"
      });
    }

    // Prevent invalid date range
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date cannot be before start date"
      });
    }

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      category,
      location,
      image,
      price: price || 0
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 📥 GET ALL EVENTS (with optional category filter)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const query = category ? { category } : {};

    const events = await Event.find(query).sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 📄 GET SINGLE EVENT (IMPORTANT for details page)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✏️ UPDATE EVENT
router.put("/:id",verifyToken,verifyAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate, category, price } = req.body;

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date, category, price: price || 0 },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ❌ DELETE EVENT
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;