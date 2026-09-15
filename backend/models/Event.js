import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      required: true,
     // enum: ["ongoing", "upcoming", "past"] // optional but good
    },

    // Optional fields (for future upgrade 🚀)
    location: {
      type: String,
      default: "Pune"
    },

    image: {
      type: String,
      default: ""
    },

    price: {
      type: Number,
      default: 0, // 0 = free event
      min: 0
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);
eventSchema.index({ category: 1, createdAt: -1 });
export default mongoose.model("Event", eventSchema);