import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { sendResetEmail } from "../utils/sendEmail.js";
const router = express.Router();


// 🔐 SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json("User already exists");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


//  LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid password");

    // create token
   const token = jwt.sign(
  { 
    id: user._id,
    role: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🔑 FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Do not reveal whether the email exists
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const rawToken = randomBytes(32).toString("hex");

   const hashedToken = createHash("sha256")
  .update(rawToken)
  .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

     await user.save();

    console.log("Reset token saved for:", user.email);
     console.log("Token expiry:", user.resetPasswordExpires);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await sendResetEmail(user.email, resetUrl);

    return res.status(200).json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
  }
});


// 🔑 RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Hash the token received from the reset link
    const hashedToken = createHash("sha256")
      .update(token)
      .digest("hex");
    console.log("Received token length:", token.length);
    console.log("Hashed token length:", hashedToken.length);
   console.log("Current time:", new Date());
    // Find a user with the matching token that has not expired
    const userWithToken = await User.findOne({
  resetPasswordToken: hashedToken,
});

console.log(
  "User found by token:",
  userWithToken ? userWithToken.email : "No user found"
);

const user = await User.findOne({
  resetPasswordToken: hashedToken,
  resetPasswordExpires: { $gt: new Date() },
});
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash and save the new password
    user.password = await bcrypt.hash(newPassword, 10);

    // Make the token unusable after one successful reset
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
  }
});

export default router;