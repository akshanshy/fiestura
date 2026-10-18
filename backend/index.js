
import "dotenv/config";
import mongoose from "mongoose";
import redisClient from "./config/redis.js";
import app from "./app.js";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error("MongoDB connection error:", err));

redisClient.connect()
  .then(() => console.log("Redis connected ✅"))
  .catch(err => console.error("Redis connection error:", err));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
