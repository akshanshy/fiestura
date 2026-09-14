import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  name: String,
  email: String,
}, { timestamps: true });
registrationSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true }
);
export default mongoose.model("Registration", registrationSchema);