//Estiak

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import { getGoogleAuthClient } from "@/lib/google-calendar";

/**
 * Helper function to verify session and get OAuth client
 */
async function getAuthenticatedClient(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return await getGoogleAuthClient(session.user.id);
}

/**
 * POST: Create a Google Calendar Event with Attendees
 */
export async function POST(req: NextRequest) {
  try {
    const oAuthClient = await getAuthenticatedClient(req);
    const { calendarId = "primary", event } = await req.json();

    console.log("Received event:", event); // Log the event data to check

    if (!event?.title || !event?.start || !event?.end) {
      return NextResponse.json(
        { error: "Invalid event data." },
        { status: 400 }
      );
    }

    // Ensure attendees is an array of objects with 'email' field
    // const attendees = event.attendees && event.attendees.length > 0
    //   ? event.attendees.map((email: string) => email ) // Ensure it's in the correct format
    //   : [];

    // if (attendees.length === 0) {
    //   return NextResponse.json({ error: "Missing attendee email." }, { status: 400 });
    // }

    console.log("Formatted attendees in backend:", event.attendees);
    // Log attendees to check

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    const response = await calendar.events.insert({
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
        reminders: {
          useDefault: true,
        },
      },
    });

    console.log("Event created:", response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Create Event Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create event." },
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
    const calendarId = searchParams.get("calendarId") || "primary";
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin ? new Date(timeMin).toISOString() : undefined,
      timeMax: timeMax ? new Date(timeMax).toISOString() : undefined,
      singleEvents: true,
      orderBy: "startTime",
      fields:
        "items(id,summary,description,start,end,attendees,creator,visibility)",
    });

    return NextResponse.json(response.data.items);
  } catch (error) {
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
    const { calendarId = "primary", eventId, event } = await req.json();

    if (!eventId || !event?.title || !event?.start || !event?.end) {
      return NextResponse.json(
        { error: "Invalid event data." },
        { status: 400 }
      );
    }

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        summary: event.title,
        description: event.description || "",
        start: {
          dateTime: new Date(event.start).toISOString(),
          timeZone: "UTC",
        },
        end: { dateTime: new Date(event.end).toISOString(), timeZone: "UTC" },
        attendees: event.attendees,
      },
      // requestBody: {
      //   summary: event.title,
      //   description: event.description || "",
      //   start: {
      //     dateTime: new Date(event.start).toISOString(),
      //     timeZone: "UTC",
      //   },
      //   end: { dateTime: new Date(event.end).toISOString(), timeZone: "UTC" },
      // },
    });

    return NextResponse.json(response.data);
  } catch (error) {
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
    const calendarId = searchParams.get("calendarId") || "primary";
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    await calendar.events.delete({ calendarId, eventId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
