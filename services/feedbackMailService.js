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

  // Email 1: Send to TUTOR and ADMIN
  const tutorAdminList = [];

  if (isTrue(process.env.FEEDBACK_EMAIL_TO_TUTOR) && tutorEmail) {
    tutorAdminList.push(tutorEmail);
  }

  if (isTrue(process.env.FEEDBACK_EMAIL_TO_ADMIN) && process.env.ADMIN_NOTIFY_EMAIL) {
    tutorAdminList.push(process.env.ADMIN_NOTIFY_EMAIL);
  }

  // remove duplicates
  const tutorAdminTo = [...new Set(tutorAdminList)].filter(Boolean);

  // Send notification email to tutor and admin
  if (tutorAdminTo.length > 0) {
    const tutorAdminSubject = `New Feedback: ${rating}/5 for ${tutorName || "Tutor"}`;

    const tutorAdminText = `
New feedback received

Tutor: ${tutorName || "-"} (${tutorEmail || "-"})
Student: ${studentName || "-"} (${studentEmail || "-"})
Rating: ${rating}/5
Session: ${sessionId || "-"}

Message:
${message || "-"}
    `.trim();

    const tutorAdminHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">New Feedback Received</h2>
        <p><strong>Tutor:</strong> ${tutorName || "-"} (${tutorEmail || "-"})</p>
        <p><strong>Student:</strong> ${studentName || "-"} (${studentEmail || "-"})</p>
        <p><strong>Rating:</strong> <strong style="color: #f59e0b;">${rating}/5 ⭐</strong></p>
        <p><strong>Session ID:</strong> ${sessionId || "-"}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p><strong>Feedback Message:</strong></p>
        <p style="background-color: #f9fafb; padding: 12px; border-left: 4px solid #0066cc; border-radius: 4px;">
          ${String(message || "-").replace(/\n/g, "<br/>")}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p style="font-size: 12px; color: #6b7280;">This is an automated notification from Quality Education Platform.</p>
      </div>
    `;

    await sendMail({
      to: tutorAdminTo.join(", "),
      subject: tutorAdminSubject,
      text: tutorAdminText,
      html: tutorAdminHtml,
    });
  }

  // Email 2: Send THANK YOU confirmation email to STUDENT
  if (isTrue(process.env.FEEDBACK_EMAIL_TO_STUDENT) && studentEmail) {
    const studentSubject = `Thank You! Your Feedback has been Received`;

    const studentText = `
Dear ${studentName || "Student"},

Thank you for submitting your feedback! Your input is vital to help our tutors improve.

Feedback Details:
- Tutor: ${tutorName || "-"}
- Rating: ${rating}/5
- Session: ${sessionId || "-"}

Your feedback will help the tutor understand how to serve you better.

Best regards,
Quality Education Team
    `.trim();

    const studentHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Thank You for Your Feedback! 🙏</h2>
        <p>Dear <strong>${studentName || "Student"}</strong>,</p>
        <p>Thank you for submitting your feedback! Your input is valuable and helps us maintain high-quality tutoring services.</p>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc;">
          <p style="margin: 0;"><strong>Feedback Summary:</strong></p>
          <p style="margin: 5px 0;">✓ <strong>Tutor:</strong> ${tutorName || "-"}</p>
          <p style="margin: 5px 0;">✓ <strong>Rating:</strong> <strong style="color: #f59e0b;">${rating}/5 ⭐</strong></p>
          <p style="margin: 5px 0;">✓ <strong>Status:</strong> <strong style="color: #10b981;">Successfully Received</strong></p>
        </div>

        <p>Your feedback will help the tutor understand how to serve you better and improve their teaching methods.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          This is an automated confirmation from <strong>Quality Education Platform</strong><br/>
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    await sendMail({
      to: studentEmail,
      subject: studentSubject,
      text: studentText,
      html: studentHtml,
    });
  }
};