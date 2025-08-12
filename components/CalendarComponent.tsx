// components/CalendarComponent.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, bn as bnLocale } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CalendarEventForm from "./CalendarForm";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { useSession } from "@/lib/auth-client";
import { useLocale, useTranslations } from "next-intl";

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

const localesMap: Record<string, Locale> = {
  en: enUS,
  "en-US": enUS,
  bn: bnLocale,
  "bn-BD": bnLocale,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: localesMap,
});

export default function GoogleCalendar() {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<GoogleEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations("calendar.component");

  // Normalize culture for react-big-calendar and Intl APIs
  const culture = useMemo(() => {
    if (locale === "bn" || locale === "bn-BD") return "bn";
    return "en-US";
  }, [locale]);

  const intlLocale = useMemo(() => (culture === "bn" ? "bn-BD" : "en-US"), [culture]);

  const [currentDateRange, setCurrentDateRange] = useState<{
    start: Date;
    end: Date;
  }>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  });

  const fetchEvents = async (start: Date, end: Date) => {
    try {
      const timeMin = start.toISOString();
      const timeMax = end.toISOString();

      const response = await fetch(`/api/calendar?timeMin=${timeMin}&timeMax=${timeMax}`);
      if (!response.ok) throw new Error("Failed to fetch events");

      const googleEvents = await response.json();

      const formattedEvents = googleEvents.map((event: any) => {
        let start: Date;
        let end: Date;

        if (event.start.dateTime) {
          start = new Date(event.start.dateTime);
          end = new Date(event.end.dateTime);
        } else {
          // All-day event - treat as local dates
          const [sy, sm, sd] = event.start.date.split("-").map(Number);
          const [ey, em, ed] = event.end.date.split("-").map(Number);
          start = new Date(sy, sm - 1, sd);
          end = new Date(ey, em - 1, ed);
        }

        return {
          id: event.id,
          title: event.summary || t("untitledEvent"),
          description: event.description || "",
          start,
          end,
          attendees: event.attendees?.map((att: any) => att.email) || [],
          creator: event.creator,
          visibility: event.visibility || "default",
        } as GoogleEvent;
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents(currentDateRange.start, currentDateRange.end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      creator: { email: (session?.user?.email as string) ?? "" },
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
      const response = await fetch("/api/calendar", {
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
            attendees: eventData.attendees,
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
    start: selectedEvent?.start ? toInputDatetimeLocal(selectedEvent.start) : "",
    end: selectedEvent?.end ? toInputDatetimeLocal(selectedEvent.end) : "",
    attendees: selectedEvent?.attendees || [],
  };

  const messages = useMemo(
    () => ({
      today: t("rbc.today"),
      previous: t("rbc.previous"),
      next: t("rbc.next"),
      month: t("rbc.month"),
      week: t("rbc.week"),
      day: t("rbc.day"),
      agenda: t("rbc.agenda"),
      showMore: (total: number) => t("rbc.showMore", { total }),
    }),
    [t]
  );

  return (
    <div className="relative h-[800px]">
      <Calendar
        culture={culture}
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
        messages={messages}
      />

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent && !isFormOpen} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogTitle className="text-xl font-bold">{t("eventDetailsTitle")}</DialogTitle>
          <div className="space-y-3">
            <p>
              <strong>{t("labels.title")}:</strong> {selectedEvent?.title}
            </p>
            <p>
              <strong>{t("labels.creatorEmail")}:</strong> {selectedEvent?.creator?.email}
            </p>
            <p>
              <strong>{t("labels.visibility")}:</strong> {selectedEvent?.visibility}
            </p>
            <p>
              <strong>{t("labels.time")}:</strong>{" "}
              {selectedEvent?.start?.toLocaleTimeString(intlLocale, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}{" "}
              -{" "}
              {selectedEvent?.end?.toLocaleTimeString(intlLocale, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p>
              <strong>{t("labels.description")}:</strong>
            </p>
            <div
              dangerouslySetInnerHTML={{
                __html: selectedEvent?.description ?? "",
              }}
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                {t("actions.close")}
              </Button>

              {selectedEvent?.creator?.email === session?.user?.email && (
                <div className="space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(true);
                      setIsFormOpen(true);
                    }}
                  >
                    {t("actions.edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => selectedEvent?.id && handleDeleteEvent(selectedEvent.id)}
                  >
                    {t("actions.delete")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent key={selectedEvent?.id || "new-event"}>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? t("formTitle.edit") : t("formTitle.create")}
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

/** Convert a Date to local datetime-local input value (YYYY-MM-DDTHH:MM) */
function toInputDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dt = new Date(d);
  return (
    dt.getFullYear() +
    "-" +
    pad(dt.getMonth() + 1) +
    "-" +
    pad(dt.getDate()) +
    "T" +
    pad(dt.getHours()) +
    ":" +
    pad(dt.getMinutes())
  );
}
