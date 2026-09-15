import express from "express";
import Event from "../models/Event.js";
import redisClient from "../config/redis.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();
const clearEventCache = async () => {
  try {
    for await (const key of redisClient.scanIterator({
      MATCH: "events:*",
      COUNT: 100
    })) {
      await redisClient.del(key);
    }

    console.log("Event cache cleared");
  } catch (err) {
    console.error("Error clearing event cache:", err);
  }
};
// 🔄 Calculate event status automatically
function getEventStatus(startDate, endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Start ongoing one day before the event
  const ongoingStart = new Date(start);
  ongoingStart.setDate(ongoingStart.getDate() - 1);

  if (today > end) {
    return "past";
  }

  if (today >= ongoingStart && today <= end) {
    return "ongoing";
  }

  return "upcoming";
}

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
    await clearEventCache();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 📥 GET ALL EVENTS (with optional category filter)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const skip = (page - 1) * limit;

    const query = category ? { category } : {};

    // Create a unique Redis key for this query
    const cacheKey = `events:${category || "all"}:page:${page}:limit:${limit}`;

    // 1. Check Redis
    const cachedEvents = await redisClient.get(cacheKey);

    if (cachedEvents) {
      console.log("Redis cache HIT:", cacheKey);

      return res.status(200).json(JSON.parse(cachedEvents));
    }

    console.log("Redis cache MISS:", cacheKey);

    // 2. Redis doesn't have the data → MongoDB
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const updatedEvents = events.map((event) => {
      const status = getEventStatus(
        event.startDate,
        event.endDate
      );

      return {
        ...event.toObject(),
        status
      };
    });

    const totalEvents = await Event.countDocuments(query);

    const responseData = {
      events: updatedEvents,
      pagination: {
        page,
        limit,
        totalEvents,
        totalPages: Math.ceil(totalEvents / limit)
      }
    };

    // 3. Store MongoDB result in Redis
    await redisClient.set(
      cacheKey,
      JSON.stringify(responseData)
    );

    console.log("Data stored in Redis:", cacheKey);

    // 4. Return response
    res.status(200).json(responseData);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.get("/clear-cache", async (req, res) => {
  await clearEventCache();

  res.json({
    message: "Cache cleared"
  });
});
// 📄 GET SINGLE EVENT (IMPORTANT for details page)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const status = getEventStatus(
      event.startDate,
      event.endDate
    );

    res.json({
      ...event.toObject(),
      status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching event",
    });
  }
});

// ✏️ UPDATE EVENT
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
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

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        startDate,
        endDate,
        category,
        location,
        image,
        price: price || 0
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }
await clearEventCache();
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
await clearEventCache();
    res.status(200).json({ message: "Event deleted successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;