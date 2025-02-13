"use client";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
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
  creator?: {
    email: string;
    displayName?: string;
  };
  visibility?: string;
}

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
  const [isEditing, setIsEditing] = useState(false);
  const [currentDateRange, setCurrentDateRange] = useState<{
    start: Date;
    end: Date;
  }>({ start: new Date(), end: new Date() });

  // Mock user - replace with actual authentication
  const currentUser = {
    email: "user@example.com",
    role: "user",
  };

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
        start: event.start?.dateTime
          ? new Date(event.start.dateTime)
          : new Date(event.start?.date),
        end: event.end?.dateTime
          ? new Date(event.end.dateTime)
          : new Date(event.end?.date),
        attendees: event.attendees?.map((att: any) => att.email) || [],
        creator: event.creator,
        visibility: event.visibility || "default",
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents(currentDateRange.start, currentDateRange.end);
  }, [currentDateRange]);

  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    const newRange = Array.isArray(range)
      ? { start: range[0], end: range[range.length - 1] }
      : range;
    setCurrentDateRange(newRange);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent({
      title: "",
      description: "",
      start: slotInfo.start,
      end: slotInfo.end,
      attendees: [],
      creator: { email: currentUser.email },
    });
    setIsFormOpen(true);
    setIsEditing(false);
  };

  const handleSelectEvent = (event: GoogleEvent) => {
    setSelectedEvent(event);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await fetch(`/api/calendar?eventId=${eventId}`, { method: "DELETE" });
      fetchEvents(currentDateRange.start, currentDateRange.end);
      setSelectedEvent(null);
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
            attendees: eventData.attendees.split(",").map((email: string) => ({
              email: email.trim(),
            })),
          },
        }),
      });

      if (!response.ok) throw new Error("Operation failed");

      fetchEvents(currentDateRange.start, currentDateRange.end);
      setIsFormOpen(false);
      setSelectedEvent(null);
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

      {/* Event Details Modal */}
      {selectedEvent && !isFormOpen && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white m-4 p-6 rounded-lg shadow-lg max-w-[60vh] max-h-[70vh] overflow-y-auto z-10">
            <h3 className="text-xl font-semibold mb-4">Event Details</h3>
            <p>
              <strong>Title:</strong> {selectedEvent.title}
            </p>
            <p>
              <strong>Creator Email:</strong> {selectedEvent.creator?.email}
            </p>
            <p>
              <strong>Visibility:</strong> {selectedEvent.visibility}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {selectedEvent.start.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}{" "}
              -{" "}
              {selectedEvent.end.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p>
              <strong>Description:</strong>
            </p>
            <div
              dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
            />

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>

              {selectedEvent.creator?.email === currentUser.email && (
                <div className="space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(true);
                      setIsFormOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      selectedEvent.id && handleDeleteEvent(selectedEvent.id)
                    }
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <CalendarEventForm
            initialValues={initialValues}
            onSubmit={handleSubmitEvent}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedEvent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
