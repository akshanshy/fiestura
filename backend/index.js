import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import paymentRoutes from "./routes/payment.js";
import eventRoutes from "./routes/events.js";
import authRoutes from "./routes/auth.js";
import registrationRoutes from "./routes/registrations.js";




const app = express();

// 🔥 CORS MUST BE FIRST
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fiestura.vercel.app",
    "https://fiestura-45xwf080z-infine.vercel.app"
  ],
  credentials: true
}));

// 🔥 THEN JSON
app.use(express.json());

// 🔥 ROUTES AFTER
app.use("/events", eventRoutes);
app.use("/auth", authRoutes);
app.use("/registrations", registrationRoutes);
app.use("/api/payment", paymentRoutes);

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log(err));

// test
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});