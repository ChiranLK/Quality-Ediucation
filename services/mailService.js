import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

console.log("SMTP CONFIG:", process.env.MAIL_HOST, process.env.MAIL_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  const fromName = process.env.MAIL_FROM_NAME || "App";
  const fromEmail = process.env.MAIL_FROM_EMAIL || "no-reply@example.com";

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
};