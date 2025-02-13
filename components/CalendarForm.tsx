"use client";

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
  const [event, setEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    attendees: [] as string[], // Ensure this is always an array
  });

  const { data: session } = useSession();

  const userEmail = session?.user?.email || "";
  const [emailList, setEmailList] = useState<string[]>([userEmail]);
  const [users, setUsers] = useState<User[]>([]);


  console.log("Calender Collection Mails::", emailList);

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

  useEffect(() => {
    if (!users.length) return;

    const loggedInUser = users.find((u) => u.email === userEmail);
    if (!loggedInUser) return;

    let collectedEmails = new Set<string>(); // Use Set to prevent duplicates
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

    setEmailList(Array.from(collectedEmails)); // Convert Set back to Array
  }, [users, userEmail]);

  useEffect(() => {
    if (initialValues) {
      setEvent({
        ...initialValues,
        attendees: emailList || [], // Ensure attendees is always an array
      });
    }
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  // const handleAttendeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setEvent((prevEvent) => ({
  //     ...prevEvent,
  //     attendees: value ? value.split(",").map((email) => email.trim()) : [], // Split and trim emails
  //   }));
  // };

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
              attendees: emailList, // Add the formatted attendees here
            },
          }),
        });

        if (!response.ok) throw new Error("Failed to create event");
        const data = await response.json(); // Log the response for debugging
        console.log("Event created:", data);
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
      console.error("Operation failed:", err); // Log the error
    }
  };

  const getParentEmail = (user: User, users: User[]): string | null => {
    let parentUser: User | undefined;
    switch (user.role) {
      case "divisionadmin":
        parentUser = users.find((u) => u.role === "centraladmin");
        break;
      case "districtadmin":
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "upozilaadmin":
        parentUser = users.find(
          (u) => u.role === "districtadmin" && u.district === user.district
        );
        // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "divisionadmin" && u.division === user.division
          );
        }
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "unionadmin":
        parentUser = users.find(
          (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
        );
        // Step 3: If no unionadmin is found, find a districtadmin in the same district
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "districtadmin" && u.district === user.district
          );
        }
        // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "divisionadmin" && u.division === user.division
          );
        }
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "daye":
        // Step 1: Try to find a unionadmin in the same union
        parentUser = users.find(
          (u) => u.role === "unionadmin" && u.union === user.union
        );

        // Step 2: If no unionadmin is found, find a upozila in the same upozila
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
          );
        }

        // Step 3: If no unionadmin is found, find a districtadmin in the same district
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "districtadmin" && u.district === user.district
          );
        }
        // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "divisionadmin" && u.division === user.division
          );
        }
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
        value={emailList} // Ensure it's an array before calling .join()
        //onChange={handleAttendeeChange}
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
