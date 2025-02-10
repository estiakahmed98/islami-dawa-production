import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import { getGoogleAuthClient } from "@/lib/google-calendar";

/**
 * POST: Create a Google Calendar Event
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { calendarId = "primary", event } = await req.json();

    if (!event.title || !event.description || !event.start || !event.end) {
      return NextResponse.json(
        { error: "Invalid event data." },
        { status: 400 }
      );
    }

    console.log(event);

    const oAuthClient = await getGoogleAuthClient(session.user.id);

    console.log(oAuthClient);

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    const response = await calendar.events.insert({
      calendarId,
      auth: oAuthClient,
      requestBody: {
        summary: event.title,
        description: event.description || "",
        start: {
          dateTime: new Date(event.start).toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: new Date(event.end).toISOString(),
          timeZone: "UTC",
        },
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Create Event Error:", error);
    return NextResponse.json(
      { error: "Failed to create event." },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve Google Calendar Events
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const calendarId = searchParams.get("calendarId") || "primary";
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    const oAuthClient = await getGoogleAuthClient(session.user.id);

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin ? new Date(timeMin).toISOString() : undefined,
      timeMax: timeMax ? new Date(timeMax).toISOString() : undefined,
      singleEvents: true,
      orderBy: "startTime",
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
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { calendarId = "primary", eventId, event } = await req.json();

    if (
      !eventId ||
      !event.title ||
      !event.description ||
      !event.start ||
      !event.end
    ) {
      return NextResponse.json(
        { error: "Invalid event data." },
        { status: 400 }
      );
    }

    const oAuthClient = await getGoogleAuthClient(session.user.id);

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    const response = await calendar.events.update({
      calendarId,
      eventId,
      auth: oAuthClient,
      requestBody: {
        summary: event.title,
        description: event.description || "",
        start: {
          dateTime: new Date(event.start).toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: new Date(event.end).toISOString(),
          timeZone: "UTC",
        },
      },
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
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const calendarId = searchParams.get("calendarId") || "primary";
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    const oAuthClient = await getGoogleAuthClient(session.user.id);

    const calendar = google.calendar({ version: "v3", auth: oAuthClient });
    const response = await calendar.events.delete({
      calendarId,
      eventId,
      auth: oAuthClient,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
