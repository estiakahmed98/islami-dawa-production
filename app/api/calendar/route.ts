//API/calendar/route.ts
//Estiak

import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuthClient } from "@/lib/google-calendar";
import { getServerAuthSession } from "@/lib/auth";

/**
 * Helper function to verify session and get OAuth client
 */
async function getAuthenticatedClient(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  return await getGoogleAuthClient(session.user.id);
}

/**
 * POST: Create a Google Calendar Event with Attendees
 */
export async function POST(req: NextRequest) {
  try {
    const oAuthClient = await getAuthenticatedClient(req);
    const defaultCal = process.env.GOOGLE_CALENDAR_ID || "primary";
    const { calendarId = defaultCal, event } = await req.json();

    if (!event?.title || !event?.start || !event?.end) {
      return NextResponse.json(
        { error: "Invalid event data." },
        { status: 400 }
      );
    }
    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    let response;
    try {
      response = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: event.title,
          description: event.description || "",
          start: {
            dateTime: new Date(event.start).toISOString(),
            timeZone: "UTC",
          },
          end: { dateTime: new Date(event.end).toISOString(), timeZone: "UTC" },
          attendees: event.attendees,
          reminders: { useDefault: true },
        },
      });
    } catch (e: any) {
      // Fallback to primary on 404 calendar not found
      if ((e?.response?.status || e?.code) === 404 && calendarId !== "primary") {
        response = await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: event.title,
            description: event.description || "",
            start: { dateTime: new Date(event.start).toISOString(), timeZone: "UTC" },
            end: { dateTime: new Date(event.end).toISOString(), timeZone: "UTC" },
            attendees: event.attendees,
            reminders: { useDefault: true },
          },
        });
      } else {
        throw e;
      }
    }
    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error?.code === 401 || /Invalid Credentials/i.test(String(error?.message || ""))) {
      return NextResponse.json(
        { error: "Google credentials invalid or expired. Please sign in with Google again to reconnect Calendar." },
        { status: 403 }
      );
    }
    if (String(error?.message || "").includes("No Google account linked")) {
      return NextResponse.json({ error: "No Google account linked to this user" }, { status: 403 });
    }
    console.error("Create Event Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to create event." },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve Google Calendar Events
 */
export async function GET(req: NextRequest) {
  try {
    const oAuthClient = await getAuthenticatedClient(req);
    const { searchParams } = new URL(req.url);
    const calendarId = searchParams.get("calendarId") || process.env.GOOGLE_CALENDAR_ID || "primary";
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    let response;
    try {
      response = await calendar.events.list({
        calendarId,
        timeMin: timeMin ? new Date(timeMin).toISOString() : undefined,
        timeMax: timeMax ? new Date(timeMax).toISOString() : undefined,
        singleEvents: true,
        orderBy: "startTime",
        fields: "items(id,summary,description,start,end,attendees,creator,visibility)",
      });
    } catch (e: any) {
      if ((e?.response?.status || e?.code) === 404 && calendarId !== "primary") {
        response = await calendar.events.list({
          calendarId: "primary",
          timeMin: timeMin ? new Date(timeMin).toISOString() : undefined,
          timeMax: timeMax ? new Date(timeMax).toISOString() : undefined,
          singleEvents: true,
          orderBy: "startTime",
          fields: "items(id,summary,description,start,end,attendees,creator,visibility)",
        });
      } else {
        throw e;
      }
    }

    return NextResponse.json(response.data.items);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const status = error?.response?.status || error?.code;
    const gMessage = error?.response?.data?.error?.message || error?.message || "";
    if (status === 401 || /Invalid Credentials/i.test(String(gMessage))) {
      return NextResponse.json(
        { error: "Google credentials invalid or expired. Please sign in with Google again to reconnect Calendar." },
        { status: 403 }
      );
    }
    if (status === 403) {
      return NextResponse.json(
        { error: "Forbidden: Your Google account does not have access to the configured calendar. Share the calendar with your account or remove GOOGLE_CALENDAR_ID to use your primary calendar." },
        { status: 403 }
      );
    }
    if (status === 404) {
      return NextResponse.json(
        { error: "Calendar not found. Check GOOGLE_CALENDAR_ID or remove it to use your primary calendar." },
        { status: 404 }
      );
    }
    if (String(error?.message || "").includes("No Google account linked")) {
      return NextResponse.json({ error: "No Google account linked to this user" }, { status: 403 });
    }
    if (String(error?.message || "").includes("No Google credentials stored")) {
      return NextResponse.json({ error: "No Google credentials stored. Please sign in with Google to connect Calendar." }, { status: 403 });
    }
    console.error("Get Events Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve events." },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update a Google Calendar Event
 */
export async function PUT(req: NextRequest) {
  try {
    const oAuthClient = await getAuthenticatedClient(req);
    const defaultCal = process.env.GOOGLE_CALENDAR_ID || "primary";
    const { calendarId = defaultCal, eventId, event } = await req.json();

    if (!eventId || !event?.title || !event?.start || !event?.end) {
      return NextResponse.json(
        { error: "Invalid event data." },
        { status: 400 }
      );
    }

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    let response;
    try {
      response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: {
          summary: event.title,
          description: event.description || "",
          start: { dateTime: new Date(event.start).toISOString(), timeZone: "UTC" },
          end: { dateTime: new Date(event.end).toISOString(), timeZone: "UTC" },
          attendees: event.attendees,
        },
      });
    } catch (e: any) {
      if ((e?.response?.status || e?.code) === 404 && calendarId !== "primary") {
        response = await calendar.events.update({
          calendarId: "primary",
          eventId,
          requestBody: {
            summary: event.title,
            description: event.description || "",
            start: { dateTime: new Date(event.start).toISOString(), timeZone: "UTC" },
            end: { dateTime: new Date(event.end).toISOString(), timeZone: "UTC" },
            attendees: event.attendees,
          },
        });
      } else {
        throw e;
      }
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (String(error?.message || "").includes("No Google account linked")) {
      return NextResponse.json({ error: "No Google account linked to this user" }, { status: 403 });
    }
    console.error("Update Event Error:", error);
    return NextResponse.json(
      { error: "Failed to update event." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a Google Calendar Event
 */
export async function DELETE(req: NextRequest) {
  try {
    const oAuthClient = await getAuthenticatedClient(req);
    const { searchParams } = new URL(req.url);
    const calendarId = searchParams.get("calendarId") || process.env.GOOGLE_CALENDAR_ID || "primary";
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    try {
      await calendar.events.delete({ calendarId, eventId });
    } catch (e: any) {
      if ((e?.response?.status || e?.code) === 404 && calendarId !== "primary") {
        await calendar.events.delete({ calendarId: "primary", eventId });
      } else {
        throw e;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (String(error?.message || "").includes("No Google account linked")) {
      return NextResponse.json({ error: "No Google account linked to this user" }, { status: 403 });
    }
    console.error("Delete Event Error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
