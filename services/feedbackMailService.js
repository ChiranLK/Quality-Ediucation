import { sendMail } from "./mailService.js";

const isTrue = (v) => String(v).toLowerCase() === "true";

export const sendFeedbackNotificationEmail = async ({
  studentName,
  studentEmail,
  tutorName,
  tutorEmail,
  rating,
  message,
  sessionId,
}) => {
  if (!isTrue(process.env.SEND_FEEDBACK_EMAIL)) return;

  const toList = [];

  if (isTrue(process.env.FEEDBACK_EMAIL_TO_TUTOR) && tutorEmail) {
    toList.push(tutorEmail);
  }

  if (isTrue(process.env.FEEDBACK_EMAIL_TO_ADMIN) && process.env.ADMIN_NOTIFY_EMAIL) {
    toList.push(process.env.ADMIN_NOTIFY_EMAIL);
  }

  // remove duplicates
  const to = [...new Set(toList)].filter(Boolean);

  if (to.length === 0) return;

  const subject = `New Feedback: ${rating}/5 for ${tutorName || "Tutor"}`;

  const text = `
New feedback received

Tutor: ${tutorName || "-"} (${tutorEmail || "-"})
Student: ${studentName || "-"} (${studentEmail || "-"})
Rating: ${rating}/5
Session: ${sessionId || "-"}

Message:
${message || "-"}
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>New Feedback Received</h2>
      <p><strong>Tutor:</strong> ${tutorName || "-"} (${tutorEmail || "-"})</p>
      <p><strong>Student:</strong> ${studentName || "-"} (${studentEmail || "-"})</p>
      <p><strong>Rating:</strong> ${rating}/5</p>
      <p><strong>Session:</strong> ${sessionId || "-"}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${String(message || "-").replace(/\n/g, "<br/>")}</p>
    </div>
  `;

  // Send one email with multiple recipients
  await sendMail({
    to: to.join(", "),
    subject,
    text,
    html,
  });
};