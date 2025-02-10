import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import { getGoogleAuthClient } from "@/lib/google-calendar";

/**
 * GET: Fetch a Google Calendar Event
 */
export async function GET(req: NextRequest) {
  try {
    // Retrieve user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract eventId from request query
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const calendarId = searchParams.get("calendarId") || "primary";

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    // Initialize Google Calendar client
    const calendar = google.calendar({ version: "v3" });
    const response = await calendar.events.get({
      calendarId,
      eventId,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("GET Event Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event." },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a Google Calendar Event
 */
export async function POST(req: NextRequest) {
  try {
    // Retrieve user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { calendarId = "primary", event } = await req.json();

    // Validate event data
    if (!event || !event.summary || !event.start || !event.end) {
      return NextResponse.json(
        { error: "Invalid event data." },
        { status: 400 }
      );
    }

    const oAuthClient = await getGoogleAuthClient(session.user.id);

    // Initialize Google Calendar client
    const calendar = google.calendar({ version: "v3" });
    const response = await calendar.events.insert({
      calendarId,
      auth: oAuthClient,
      requestBody: event,
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
 * PUT: Update a Google Calendar Event
 */
export async function PUT(req: NextRequest) {
  try {
    // Retrieve user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { calendarId = "primary", eventId, event } = await req.json();

    if (!eventId || !event) {
      return NextResponse.json(
        { error: "Event ID and data are required." },
        { status: 400 }
      );
    }

    // Initialize Google Calendar client
    const calendar = google.calendar({ version: "v3" });
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
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
 * DELETE: Remove a Google Calendar Event
 */
export async function DELETE(req: NextRequest) {
  try {
    // Retrieve user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { calendarId = "primary", eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    // Initialize Google Calendar client
    const calendar = google.calendar({ version: "v3" });
    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return NextResponse.json(
      { message: "Event deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Event Error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
