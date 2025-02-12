"use client";

import { useState, useEffect } from "react";

interface CalendarEventFormProps {
  initialValues?: {
    title: string;
    description: string;
    start: string;
    end: string;
    attendees: string[]; // Ensure attendees is always an array
  };
  onSubmit?: (event: any) => Promise<void>;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const CalendarEventForm = ({
  initialValues,
  onSubmit,
  onSubmitSuccess,
  onCancel,
}: CalendarEventFormProps) => {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    attendees: [] as string[], // Ensure this is always an array
  });

  useEffect(() => {
    if (initialValues) {
      setEvent({
        ...initialValues,
        attendees: initialValues.attendees || [], // Ensure attendees is always an array
      });
    }
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleAttendeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEvent((prevEvent) => ({
      ...prevEvent,
      attendees: value ? value.split(",").map((email) => email.trim()) : [], // Split and trim emails
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting event:", event); 
  
    // Ensure attendees are properly formatted
    // const formattedAttendees = event.attendees
    //   .filter((email) => email) // Remove empty emails
    //   .map((email) => ({ email })); // Format each attendee as { email: 'email@example.com' }
  
    if (event.attendees.length === 0) {
      console.error("No valid attendees provided.");
      return; // Prevent sending the request if no valid attendees
    }
  
    // Log formatted attendees to check
    // console.log("Formatted attendees:", formattedAttendees);
  
    try {
      if (onSubmit) {
        await onSubmit(event);
      } else {
        const response = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calendarId: "primary",
            event: {
              ...event,
              attendees: event.attendees, // Add the formatted attendees here
            },
          }),
        });
  
        if (!response.ok) throw new Error("Failed to create event");
        const data = await response.json(); // Log the response for debugging
        console.log("Event created:", data);
      }
      onSubmitSuccess?.();
      setEvent({ title: "", description: "", start: "", end: "", attendees: [] });
    } catch (err) {
      console.error("Operation failed:", err);  // Log the error
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <input
        type="text"
        name="title"
        placeholder="Event Title"
        value={event.title}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded"
      />
      <textarea
        name="description"
        placeholder="Event Description"
        value={event.description}
        onChange={handleChange}
        className="block w-full p-2 border rounded"
      />
      <input
        type="datetime-local"
        name="start"
        value={event.start}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded"
      />
      <input
        type="datetime-local"
        name="end"
        value={event.end}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded"
      />
      <input
        type="text"
        name="attendees"
        placeholder="Enter Attendees (comma separated emails)"
        value={event.attendees.join(", ")} // Ensure it's an array before calling .join()
        onChange={handleAttendeeChange}
        className="block w-full p-2 border rounded"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded flex-1"
        >
          {initialValues ? "Update Event" : "Create Event"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 p-2 rounded flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default CalendarEventForm;
