import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"], // 🔥 restrict values
    default: "user",
  },
  resetpasswordToken: {
    type: String,
    default: "",
  },
  resetpasswordTokenExpiry: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("User", userSchema);