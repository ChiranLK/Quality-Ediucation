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
  const { schedule, title, description, participants } = session;

  // Validate required fields
  if (!title || !title.trim()) {
    throw new Error("Session title is required for calendar event");
  }
  if (!schedule?.date || !schedule?.startTime || !schedule?.endTime) {
    throw new Error("Invalid session schedule data");
  }

  const dateStr = new Date(schedule.date).toISOString().split("T")[0]; // YYYY-MM-DD

  // Combine date + startTime / endTime
  const startDateTime = new Date(`${dateStr}T${schedule.startTime}:00+05:30`);
  const endDateTime = new Date(`${dateStr}T${schedule.endTime}:00+05:30`);

  const eventObject = {
    summary: title.trim(),
    description: description ? description.trim() : "Tutoring Session",
    start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Colombo" },
    end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Colombo" },
    attendees: Array.isArray(participants)
      ? participants
          .map((p) => p.userId?.email)
          .filter(Boolean)
          .map((email) => ({ email }))
      : [],
  };

  // Log for debugging
  console.log("🗓️ Building calendar event:", {
    summary: eventObject.summary,
    startTime: eventObject.start.dateTime,
    endTime: eventObject.end.dateTime,
    attendeeCount: eventObject.attendees.length,
  });

  return eventObject;
};

// Create event
export const createCalendarEvent = async (session) => {
  const cal = getCalendar();
  const event = buildEventObject(session);
  
  try {
    const response = await cal.events.insert({ calendarId: "primary", resource: event });
    console.log(`✅ Calendar event created successfully:`, {
      eventId: response.data.id,
      title: response.data.summary,
      start: response.data.start.dateTime,
      htmlLink: response.data.htmlLink,
    });
    return response.data.id;
  } catch (error) {
    console.error("❌ Failed to create calendar event:", {
      error: error.message,
      title: event.summary,
      schedule: { start: event.start, end: event.end },
    });
    throw error;
  }
};

// Update event
export const updateCalendarEvent = async (googleEventId, session) => {
  const cal = getCalendar();
  const event = buildEventObject(session);
  
  try {
    const response = await cal.events.update({ 
      calendarId: "primary", 
      eventId: googleEventId, 
      resource: event 
    });
    console.log(`✅ Calendar event updated successfully:`, {
      eventId: googleEventId,
      title: response.data.summary,
      start: response.data.start.dateTime,
    });
  } catch (error) {
    console.error("❌ Failed to update calendar event:", {
      eventId: googleEventId,
      error: error.message,
      title: event.summary,
    });
    throw error;
  }
};

// Delete event
export const deleteCalendarEvent = async (googleEventId) => {
  const cal = getCalendar();
  try {
    await cal.events.delete({ calendarId: "primary", eventId: googleEventId });
    console.log(`✅ Calendar event deleted successfully:`, googleEventId);
  } catch (error) {
    console.error("❌ Failed to delete calendar event:", {
      eventId: googleEventId,
      error: error.message,
    });
    throw error;
  }
};