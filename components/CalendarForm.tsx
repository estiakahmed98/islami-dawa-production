"use client";

import { useState } from "react";

const CalendarEventForm = () => {
  const [event, setEvent] = useState({
    summary: "",
    description: "",
    start: "",
    end: "",
  });

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarId: "primary", event }),
    });
    if (!response.ok) {
      console.error("Failed to create event");
    } else {
      console.log("Event created successfully");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Create Event</h2>
      <input
        type="text"
        name="summary"
        placeholder="Event Title"
        value={event.summary}
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
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Create Event
      </button>
    </form>
  );
};

export default CalendarEventForm;
