
import express from "express";
import cors from "cors";

import paymentRoutes from "./routes/payment.js";
import eventRoutes from "./routes/events.js";
import authRoutes from "./routes/auth.js";
import registrationRoutes from "./routes/registrations.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fiestura.vercel.app",
    "https://fiestura-45xwf080z-infine.vercel.app"
  ],
  credentials: true
}));

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use("/events", eventRoutes);
app.use("/auth", authRoutes);
app.use("/registrations", registrationRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

export default app;
