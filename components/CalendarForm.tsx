// "use client";

// import { useState } from "react";

// const CalendarEventForm = () => {
//   const [event, setEvent] = useState({
//     title: "",
//     description: "",
//     start: "",
//     end: "",
//   });

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setEvent({ ...event, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const response = await fetch("/api/calendar", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ calendarId: "primary", event }),
//     });
//     if (!response.ok) {
//       console.error("Failed to create event");
//     } else {
//       console.log("Event created successfully");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
//       <h2 className="text-xl font-bold">Create Event</h2>
//       <input
//         type="text"
//         name="title"
//         placeholder="Event Title"
//         value={event.title}
//         onChange={handleChange}
//         required
//         className="block w-full p-2 border rounded"
//       />
//       <textarea
//         name="description"
//         placeholder="Event Description"
//         value={event.description}
//         onChange={handleChange}
//         className="block w-full p-2 border rounded"
//       />
//       <input
//         type="datetime-local"
//         name="start"
//         value={event.start}
//         onChange={handleChange}
//         required
//         className="block w-full p-2 border rounded"
//       />
//       <input
//         type="datetime-local"
//         name="end"
//         value={event.end}
//         onChange={handleChange}
//         required
//         className="block w-full p-2 border rounded"
//       />
//       <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//         Create Event
//       </button>
//     </form>
//   );
// };

// export default CalendarEventForm;

"use client";

import { useState, useEffect } from "react";

interface CalendarEventFormProps {
  initialValues?: {
    title: string;
    description: string;
    start: string;
    end: string;
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
  });

  useEffect(() => {
    if (initialValues) {
      setEvent(initialValues);
    }
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (onSubmit) {
        await onSubmit(event);
      } else {
        const response = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calendarId: "primary", event }),
        });
        if (!response.ok) throw new Error("Failed to create event");
      }
      onSubmitSuccess?.();
      setEvent({ title: "", description: "", start: "", end: "" });
    } catch (err) {
      console.error("Operation failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      {/* <h2 className="text-xl font-bold">
        {initialValues ? "Edit Event" : "Create Event"}
      </h2> */}
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
