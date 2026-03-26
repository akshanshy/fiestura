import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  name: String,
  email: String,
}, { timestamps: true });

export default mongoose.model("Registration", registrationSchema);