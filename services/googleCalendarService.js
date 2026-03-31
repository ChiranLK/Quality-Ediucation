// services/googleCalendarService.js
import { google } from "googleapis";

let calendar = null;

// Initialize Google Calendar client
export const initCalendar = () => {
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI &&
    process.env.GOOGLE_REFRESH_TOKEN
  ) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    calendar = google.calendar({ version: "v3", auth: oauth2Client });
    console.log("✅ Google Calendar initialized");
  } else {
    console.warn("⚠️ Google Calendar disabled: missing credentials");
  }
};

export const getCalendar = () => {
  if (!calendar) throw new Error("Calendar client not initialized");
  return calendar;
};

// Helper: Convert schedule to Google Calendar event
const buildEventObject = (session) => {
  const { schedule } = session;

  if (!schedule?.date || !schedule?.startTime || !schedule?.endTime) {
    throw new Error("Invalid session schedule data");
  }

  const dateStr = new Date(schedule.date).toISOString().split("T")[0]; // YYYY-MM-DD

  // Combine date + startTime / endTime
  const startDateTime = new Date(`${dateStr}T${schedule.startTime}:00+05:30`);
  const endDateTime = new Date(`${dateStr}T${schedule.endTime}:00+05:30`);

  return {
    summary: session.title,
    description: session.description,
    start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Colombo" },
    end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Colombo" },
    attendees: Array.isArray(session.participants)
      ? session.participants
          .map((p) => p.userId?.email)
          .filter(Boolean)
          .map((email) => ({ email }))
      : [],
  };
};

// Create event
export const createCalendarEvent = async (session) => {
  const cal = getCalendar();
  const event = buildEventObject(session);
  const response = await cal.events.insert({ calendarId: "primary", resource: event });
  return response.data.id;
};

// Update event
export const updateCalendarEvent = async (googleEventId, session) => {
  const cal = getCalendar();
  const event = buildEventObject(session);
  await cal.events.update({ calendarId: "primary", eventId: googleEventId, resource: event });
};

// Delete event
export const deleteCalendarEvent = async (googleEventId) => {
  const cal = getCalendar();
  await cal.events.delete({ calendarId: "primary", eventId: googleEventId });
};