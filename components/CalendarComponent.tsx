"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CalendarEvent } from "@prisma/client";

export const CalendarComponent = () => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/calendar");
      const data = await response.json();
      setEvents(data.items || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    const newEvent = {
      summary: "New Meeting",
      description: "Important discussion",
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
    };

    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: newEvent }),
      });
      await fetchEvents();
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  useEffect(() => {
    if (session) fetchEvents();
  }, [session]);

  if (!session) return <div>Please login to access calendar</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Calendar Events</h2>
        <Button onClick={createEvent} disabled={loading}>
          {loading ? "Creating..." : "Create New Event"}
        </Button>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 border rounded-lg">
            <h3 className="font-bold">{event.title}</h3>
            <p>{event.description}</p>
            <p>{new Date(event.start).toLocaleString()}</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline">Edit</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
