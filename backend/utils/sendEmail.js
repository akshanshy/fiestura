import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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