"use client"; // Estiak

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

// ------ Types ------
type MarkazRef = { id: string; name: string };

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  phone?: string | null;
  // New schema: single relation (object) or null; keep legacy string for safety
  markaz?: MarkazRef | string | null;
  markazId?: string | null;
}

interface CalendarEventFormProps {
  initialValues?: {
    title: string;
    description: string;
    start: string; // ISO or datetime-local value
    end: string;   // ISO or datetime-local value
    attendees: string[]; // always array of emails
  };
  onSubmit?: (event: {
    title: string;
    description: string;
    start: string;
    end: string;
    attendees: { email: string }[];
  }) => Promise<void>;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

// Safely parse /api/users which may return [] or { users: [] }
async function readUsers(res: Response): Promise<User[]> {
  const json = await res.json();
  if (Array.isArray(json)) return json as User[];
  if (Array.isArray(json?.users)) return json.users as User[];
  return [];
}

// --- markaz normalization (single relation, legacy-safe) ---
const getMarkazId = (u?: User): string | null => {
  if (!u) return null;
  if (u.markaz && typeof u.markaz !== "string") return u.markaz.id ?? u.markazId ?? null;
  return u.markazId ?? null;
};
const getMarkazName = (u?: User): string | null => {
  if (!u?.markaz) return null;
  return typeof u.markaz === "string" ? u.markaz : (u.markaz.name ?? null);
};
const shareMarkaz = (a: User, b: User): boolean => {
  const aId = getMarkazId(a);
  const bId = getMarkazId(b);
  if (aId && bId) return aId === bId;
  const aName = getMarkazName(a);
  const bName = getMarkazName(b);
  if (aName && bName) return aName === bName;
  return false;
};

const getParentEmail = (
  user: User,
  users: User[],
  loggedInUser: User | null
): string | null => {
  let parentUser: User | undefined;

  switch (user.role) {
    case "divisionadmin": {
      parentUser =
        (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "markazadmin": {
      parentUser =
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
        (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "daye": {
      parentUser =
        users.find((u) => u.role === "markazadmin" && shareMarkaz(u, user)) ||
        (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    default:
      return null;
  }
  return parentUser ? parentUser.email : null;
};

const CalendarEventForm = ({
  initialValues,
  onSubmit,
  onSubmitSuccess,
  onCancel,
}: CalendarEventFormProps) => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  const [users, setUsers] = useState<User[]>([]);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [event, setEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    attendees: [] as string[], // emails
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch users");
        const usersData = await readUsers(response);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Compute hierarchical email list for auto-attendees
  useEffect(() => {
    if (!users.length || !userEmail) return;

    const loggedInUser = users.find((u) => u.email === userEmail) || null;
    if (!loggedInUser) return;

    const collectedEmails = new Set<string>();
    collectedEmails.add(loggedInUser.email);

    const findChildEmails = (parentEmail: string) => {
      users.forEach((u) => {
        if (getParentEmail(u, users, loggedInUser) === parentEmail && !collectedEmails.has(u.email)) {
          collectedEmails.add(u.email);
          findChildEmails(u.email);
        }
      });
    };
    findChildEmails(loggedInUser.email);

    setEmailList(Array.from(collectedEmails));
  }, [users, userEmail]);

  // Initialize/merge event values and attendees
  useEffect(() => {
    if (initialValues) {
      const merged = Array.from(new Set([...initialValues.attendees, ...emailList]));
      setEvent({
        title: initialValues.title || "",
        description: initialValues.description || "",
        start: initialValues.start || "",
        end: initialValues.end || "",
        attendees: merged,
      });
    } else {
      setEvent((prev) => ({
        ...prev,
        attendees: Array.from(new Set([...(prev.attendees || []), ...emailList])),
      }));
    }
  }, [initialValues, emailList]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  // Optional manual attendee input (currently hidden in UI)
  const handleAttendeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredEmails = e.target.value
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.includes("@"));
    setEvent((prev) => ({
      ...prev,
      attendees: Array.from(new Set([...emailList, ...enteredEmails])),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validAttendees = (event.attendees || [])
      .map((email) => email?.trim().toLowerCase())
      .filter((email) => !!email && email.includes("@"))
      .map((email) => ({ email }));

    if (validAttendees.length === 0) {
      console.error("No valid attendees provided");
      return;
    }

    try {
      const eventData = {
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        attendees: validAttendees,
      };

      if (onSubmit) {
        await onSubmit(eventData);
      } else {
        const response = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calendarId: "primary", event: eventData }),
        });
        if (!response.ok) throw new Error("Failed to create event");
        await response.json();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      {/* Title */}
      <input
        type="text"
        name="title"
        placeholder="Event Title"
        value={event.title}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded"
      />

      {/* Description */}
      <textarea
        name="description"
        placeholder="Event Description"
        value={event.description}
        onChange={handleChange}
        className="block w-full p-2 border rounded"
      />

      {/* Start */}
      <input
        type="datetime-local"
        name="start"
        value={event.start}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded"
      />

      {/* End */}
      <input
        type="datetime-local"
        name="end"
        value={event.end}
        onChange={handleChange}
        required
        className="block w-full p-2 border rounded"
      />

      {/* Hidden extra attendees field (kept for future UX) */}
      <input
        type="text"
        placeholder="Additional attendees (comma-separated)"
        value={event.attendees.filter((e) => !emailList.includes(e)).join(", ")}
        onChange={handleAttendeeChange}
        className="hidden"
      />

      {/* Hidden display of auto-included attendees */}
      <div className="text-sm text-gray-600 hidden">
        Auto-included attendees: {emailList.join(", ")}
      </div>

      {/* Buttons */}
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
