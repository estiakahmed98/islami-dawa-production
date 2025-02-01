"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import TaskForm from "./ToDoTaskForm";
import { DayPilotMonth, DayPilot } from "@daypilot/daypilot-lite-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

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
  // For DayPilot usage:
  text?: string;
  start?: string;
  end?: string;
}

const TodoListCalendar = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const userRole = session?.user?.role || "";

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [startDate, setStartDate] = useState(DayPilot.Date.today());
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

      // Convert each to DayPilot event format
      const mapped = allTasks.map((task) => {
        const d = new Date(task.date);
        const safeDate = isNaN(d.getTime())
          ? new Date().toISOString().split("T")[0]
          : d.toISOString().split("T")[0];

        return {
          ...task,
          text: task.title,
          start: safeDate,
          end: safeDate,
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
  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;
    const dayString = date.toISOString().split("T")[0];
    setSelectedDate(dayString);
    setSelectedTask(null);
    setIsOpen(true);
    setIsEditing(false);
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
      <h2 className="text-2xl font-semibold mb-4">To-Do List Calendar</h2>

      {/* Nav + current month */}
      <div className="flex mb-2 gap-2 items-center">
        <button
          className="bg-[#227f9b] text-white px-4 py-2 rounded"
          onClick={() => setStartDate(startDate.addMonths(-1))}
        >
          <FaArrowLeft />
        </button>
        <p className="bg-[#227f9b] text-white px-4 py-2 rounded">
          {startDate.toString("MMMM yyyy")}
        </p>
        <button
          className="bg-[#227f9b] text-white px-4 py-2 rounded"
          onClick={() => setStartDate(startDate.addMonths(1))}
        >
          <FaArrowRight />
        </button>
      </div>

      <DayPilotMonth
        startDate={startDate}
        onTimeRangeSelected={(args) =>
          handleDateClick(new Date(args.start.toString()))
        }
        events={tasks.map((t) => ({
          id: t.id,
          text: t.text ?? t.title,
          start: t.start!,
          end: t.end!,
        }))}
        onEventClick={(args) => {
          const found = tasks.find((t) => t.id === args.e.id());
          if (found) setSelectedTask(found);
        }}
      />

      {/* If event is clicked, show details */}
      {selectedTask && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white m-4 p-6 rounded-lg shadow-lg max-w-[60vh] max-h-[70vh] overflow-y-auto z-10">
            <h3 className="text-xl font-semibold mb-4">Task Details</h3>
            <p>
              <strong>Title:</strong> {selectedTask.title}
            </p>
            <p>
              <strong>Creator Email:</strong> {selectedTask.email}
            </p>
            <p>
              <strong>Creator Role:</strong> {selectedTask.creatorRole}
            </p>
            <p>
              <strong>Creator Division:</strong> {selectedTask.division}
            </p>
            <p>
              <strong>Creator District:</strong> {selectedTask.district}
            </p>
            <p>
              <strong>Creator Upazila:</strong> {selectedTask.upazila}
            </p>
            <p>
              <strong>Creator Union:</strong> {selectedTask.union}
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

              {/* 
                Show Edit/Delete if:
                  - user is the owner (email match)
                  (If you want centraladmin to also be able, 
                   add condition like userRole==="centraladmin" ) 
              */}
              {selectedTask.email === userEmail && (
                <div className="space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      setIsEditing(true);
                      setSelectedDate(selectedTask.date);
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
