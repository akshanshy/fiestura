import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    role: user.role   // 🔥 ADD THIS
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
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");
    
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    
    user.resetpasswordToken = resetToken;
    user.resetpasswordTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    
    res.json({ message: "Reset token generated", resetToken });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🔑 RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      _id: decoded.id,
      resetpasswordToken: token,
      resetpasswordTokenExpiry: { $gt: new Date() }
    });
    
    if (!user) return res.status(400).json("Invalid or expired token");
    
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetpasswordToken = undefined;
    user.resetpasswordTokenExpiry = undefined;
    await user.save();
    
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

export default router;