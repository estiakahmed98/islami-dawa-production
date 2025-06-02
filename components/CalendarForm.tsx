"use client"; //Estiak

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  markaz?: string;
  phone?: string;
}

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
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const [emailList, setEmailList] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Initialize event state with proper type
  const [event, setEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    attendees: [] as string[],
  });

  // Fetch users and process email list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch users");
        const usersData: User[] = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Process email list based on user hierarchy
  useEffect(() => {
    if (!users.length) return;

    const processEmails = () => {
      const loggedInUser = users.find((u) => u.email === userEmail);
      if (!loggedInUser) return;

      const collectedEmails = new Set<string>();
      collectedEmails.add(loggedInUser.email);

      const findChildEmails = (parentEmail: string) => {
        users.forEach((user) => {
          if (
            getParentEmail(user, users) === parentEmail &&
            !collectedEmails.has(user.email)
          ) {
            collectedEmails.add(user.email);
            findChildEmails(user.email);
          }
        });
      };

      findChildEmails(loggedInUser.email);
      return Array.from(collectedEmails);
    };

    setEmailList(processEmails() || []);
  }, [users, userEmail]);

  useEffect(() => {
    if (initialValues) {
      const mergedAttendees = [
        ...new Set([...initialValues.attendees, ...emailList]),
      ];
      setEvent({
        ...initialValues,
        attendees: mergedAttendees,
      });
    } else {
      setEvent((prev) => ({
        ...prev,
        attendees: emailList,
      }));
    }
  }, [initialValues, emailList]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleAttendeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredEmails = e.target.value
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.includes("@")); // Basic validation
    setEvent((prev) => ({
      ...prev,
      attendees: [...emailList, ...enteredEmails],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ensure we have valid attendees
    const validAttendees = event.attendees
      .filter((email) => email && email.includes("@"))
      .map((email) => ({ email }));

    if (validAttendees.length === 0) {
      console.error("No valid attendees provided");
      return;
    }

    try {
      const eventData = {
        ...event,
        attendees: validAttendees,
      };

      if (onSubmit) {
        await onSubmit(eventData);
      } else {
        const response = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calendarId: "primary",
            event: eventData,
          }),
        });

        if (!response.ok) throw new Error("Failed to create event");
        const data = await response.json();
      }

      onSubmitSuccess?.();
      setEvent({
        title: "",
        description: "",
        start: "",
        end: "",
        attendees: [],
      });
    } catch (err) {
      console.error("Operation failed:", err);
    }
  };

  const getParentEmail = (user: User, users: User[]): string | null => {
    let parentUser: User | undefined;
    switch (user.role) {
      case "divisionadmin":
        parentUser = users.find((u) => u.role === "centraladmin");
        break;
      case "markazadmin":
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "daye":
        parentUser = users.find(
          (u) => u.role === "markazadmin" && u.markaz === user.markaz
        );
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;

      default:
        return null;
    }
    return parentUser ? parentUser.email : null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      {/* Title Input */}
      <input
        type="text"
        name="title"
        placeholder="Event Title"
        value={event.title}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded"
      />

      {/* Description Textarea */}
      <textarea
        name="description"
        placeholder="Event Description"
        value={event.description}
        onChange={handleChange}
        className="block w-full p-2 border rounded"
      />

      {/* Start Time Input */}
      <input
        type="datetime-local"
        name="start"
        value={event.start}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded"
      />

      {/* End Time Input */}
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
        placeholder="Additional attendees (comma-separated)"
        value={event.attendees.filter((e) => !emailList.includes(e)).join(", ")}
        onChange={handleAttendeeChange}
        className="hidden"
      />

      {/* Auto-included attendees display */}
      <div className="text-sm text-gray-600 hidden">
        Auto-included attendees: {emailList.join(", ")}
      </div>

      {/* Form Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded flex-1"
        >
          {initialValues ? "Create Event" : "Update Event"}
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
