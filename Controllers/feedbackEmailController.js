import { sendMail } from "../services/mailService.js";

export const sendFeedbackNotification = async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      rating,
      message,
      course,
      tutorName,
    } = req.body;

    // Basic validation
    if (!studentName || !studentEmail || !rating || !message) {
      return res.status(400).json({
        message: "studentName, studentEmail, rating, and message are required",
      });
    }

    const to = process.env.ADMIN_NOTIFY_EMAIL || "admin@qualityapp.com";

    const subject = `New Feedback Received (${rating}/5)`;

    const text = `
New feedback received:

Student: ${studentName} (${studentEmail})
Course: ${course || "-"}
Tutor: ${tutorName || "-"}
Rating: ${rating}/5

Message:
${message}
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2>New Feedback Received</h2>
        <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
        <p><strong>Course:</strong> ${course || "-"}</p>
        <p><strong>Tutor:</strong> ${tutorName || "-"}</p>
        <p><strong>Rating:</strong> ${rating}/5</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br/>")}</p>
      </div>
    `;

    await sendMail({ to, subject, text, html });

    return res.status(200).json({
      message: "Feedback notification email sent (check Mailtrap inbox)",
    });
  } catch (err) {
    console.error("sendFeedbackNotification error:", err);
    return res.status(500).json({
      message: "Failed to send feedback notification email",
      error: err?.message || "Unknown error",
    });
  }
};