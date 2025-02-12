"use client";

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CalendarEventForm from "./CalendarForm";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

interface GoogleEvent {
  id?: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendees?: string[];
}

// Setup the localizer for react-big-calendar
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function GoogleCalendar() {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<GoogleEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentDateRange, setCurrentDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(),
    end: new Date(),
  });

  // Fetch events from API
  const fetchEvents = async (start: Date, end: Date) => {
    try {
      const timeMin = start.toISOString();
      const timeMax = end.toISOString();

      const response = await fetch(
        `/api/calendar?timeMin=${timeMin}&timeMax=${timeMax}`
      );
      if (!response.ok) throw new Error("Failed to fetch events");

      const googleEvents = await response.json();

      const formattedEvents = googleEvents.map((event: any) => ({
        id: event.id,
        title: event.summary || "Untitled Event",
        description: event.description || "",
        start: event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date),
        end: event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end?.date),
        attendees: Array.isArray(event.attendees) ? event.attendees.map((att: any) => att.email) : [],
      }));
      

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents(currentDateRange.start, currentDateRange.end);
  }, [currentDateRange]);

  // Handle date range change (when navigating between months/weeks)
  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    if (Array.isArray(range)) {
      setCurrentDateRange({ start: range[0], end: range[range.length - 1] });
    } else {
      setCurrentDateRange(range);
    }
  };

  // Handle event creation when a time slot is selected
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setIsFormOpen(true);
    setSelectedEvent({
      title: "",
      description: "",
      start: slotInfo.start,
      end: slotInfo.end,
      attendees: [],
    });
  };

  // Handle event editing when an event is clicked
  const handleSelectEvent = (event: GoogleEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await fetch(`/api/calendar?eventId=${eventId}`, {
        method: "DELETE",
      });
      fetchEvents(currentDateRange.start, currentDateRange.end);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSubmitEvent = async (eventData: any) => {
    try {
      const method = selectedEvent?.id ? "PUT" : "POST";
      const url = "/api/calendar";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId: "primary",
          eventId: selectedEvent?.id,
          event: {
            title: eventData.title,
            description: eventData.description,
            start: eventData.start,
            end: eventData.end,
            attendees: eventData.attendees.map((email: string) => ({
              email: email.trim(),
            })),
          },
        }),
      });

      if (!response.ok) throw new Error("Operation failed");

      fetchEvents(currentDateRange.start, currentDateRange.end);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const initialValues = {
    title: selectedEvent?.title || "",
    description: selectedEvent?.description || "",
    start: selectedEvent?.start?.toISOString().slice(0, 16) || "",
    end: selectedEvent?.end?.toISOString().slice(0, 16) || "",
    attendees: selectedEvent?.attendees?.join(", ") || "",
  };

  return (
    <div className="relative h-[800px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onRangeChange={handleRangeChange}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        defaultView="month"
        views={["month", "week", "day"]}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogTitle className="text-xl font-bold">
            {selectedEvent?.id ? "Edit Event" : "Create Event"}
          </DialogTitle>
          {selectedEvent && (
            <CalendarEventForm
              initialValues={initialValues}
              onSubmit={handleSubmitEvent}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
          {selectedEvent?.id && (
            <Button
              variant="destructive"
              onClick={() => handleDeleteEvent(selectedEvent.id!)}
              className="mt-4"
            >
              Delete Event
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
