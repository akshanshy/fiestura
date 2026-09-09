import "dotenv/config";
import nodemailer from "nodemailer";

console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS exists:", Boolean(process.env.SMTP_PASS));

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // Use IPv4
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready");
  }
});

export const sendResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Reset your Fiestura password",
    text: `Click this link to reset your password: ${resetUrl}`,
    html: `
      <h2>Password Reset</h2>
      <p>You requested to reset your Fiestura password.</p>
      <p>This link will expire in 15 minutes.</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};