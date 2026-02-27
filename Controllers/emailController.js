import { sendMail } from "../services/mailService.js";

export const sendTestEmail = async (req, res) => {
  try {
    await sendMail({
      to: "test@example.com",
      subject: "Test Email",
      text: "This is a test email from MERN app (Mailtrap sandbox)."
    });

    res.json({ message: "Email sent (check Mailtrap inbox)" });
  } catch (err) {
    console.error("sendTestEmail error:", err);
    res.status(500).json({
      message: "Failed to send email",
      error: err?.message || "Unknown error"
    });
  }
};