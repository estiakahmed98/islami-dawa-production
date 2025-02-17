"use client"; //Estiak

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import TaskForm from "./ToDoTaskForm";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface Task {
  id: string;
  email: string; // who created
  creatorRole: string; // role of the creator
  date: string; // e.g., "2025-01-29T12:00:00.000Z"
  title: string;
  time: string;
  visibility: string; // "private" or "public"
  description: string;
  division?: string;
  district?: string;
  area?: string;
  upazila?: string;
  union?: string;
  start: Date;
  end: Date;
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

const TodoListCalendar = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const userRole = session?.user?.role || "";

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error while fetching.");
      }

      const data = await response.json();
      const allTasks: Task[] = data.records;

      // Convert each to Calendar event format
      const mapped = allTasks.map((task) => {
        const start = new Date(task.date);
        const end = new Date(task.date);
        end.setHours(end.getHours() + 1); // Set end time 1 hour after start

        return {
          ...task,
          start,
          end,
        };
      });

      setTasks(mapped);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unexpected error fetching tasks.");
      }
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle selecting an empty date cell
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const selectedDate = new Date(slotInfo.start);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent selecting past dates
    if (selectedDate < today) {
      toast.error("You cannot select a past date.");
      return;
    }

    setSelectedDate(selectedDate);
    setSelectedTask(null);
    setIsOpen(true);
    setIsEditing(false);
  };

  // Handle event editing when an event is clicked
  const handleSelectEvent = (event: Task) => {
    setSelectedTask(event);
  };

  // Delete a task
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTask.id }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete.");
      }

      toast.success("Task deleted!");
      fetchTasks();
      setSelectedTask(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unexpected error deleting task.");
      }
    }
  };

  // Close modals with Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSelectedTask(null);
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">কর্মসূচি</h2>

      {/* Calendar Component */}
      <div className="h-[800px]">
        <Calendar
          localizer={localizer}
          events={tasks}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={["month", "week", "day"]}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
        />
      </div>

      {/* If event is clicked, show details */}
      {selectedTask && (
        <div>
          <div className="bg-white m-4 p-6 rounded-lg shadow-lg max-w-[60vh] max-h-[70vh] overflow-y-auto z-10">
            <h3 className="text-xl font-semibold mb-4">Task Details</h3>
            <p>
              <strong>Title:</strong> {selectedTask.title}
            </p>
            <p>
              <strong>Creator Email:</strong> {selectedTask.email}
            </p>
            <p>
              <strong>Role:</strong> {selectedTask.creatorRole}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(`1970-01-01T${selectedTask.time}`).toLocaleTimeString(
                "en-US",
                { hour: "2-digit", minute: "2-digit", hour12: true }
              )}
            </p>
            <p>
              <strong>Visibility:</strong> {selectedTask.visibility}
            </p>
            <p>
              <strong>Description:</strong>
            </p>
            <div
              dangerouslySetInnerHTML={{ __html: selectedTask.description }}
            ></div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>

              {selectedTask.email === userEmail && (
                <div className="space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      setIsEditing(true);
                      setSelectedDate(new Date(selectedTask.date));
                      setIsOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-700 text-white px-4 py-2 rounded"
                    onClick={handleDeleteTask}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add or Edit modal */}
      {isOpen && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-30">
          <TaskForm
            userEmail={userEmail}
            userRole={userRole}
            selectedDate={selectedDate}
            setIsOpen={setIsOpen}
            fetchTasks={fetchTasks}
            taskData={isEditing ? selectedTask : null}
            setIsEditing={setIsEditing}
          />
        </div>
      )}
    </div>
  );
};

export default TodoListCalendar;
