"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import TaskForm from "./ToDoTaskForm";
import { DayPilotMonth, DayPilot } from "@daypilot/daypilot-lite-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface Task {
  id: string;
  email: string;
  date: string; // ✅ Should be in 'YYYY-MM-DDTHH:mm:ss' format
  title: string;
  time: string;
  visibility: string;
  description: string;
  division?: string;
  district?: string;
  area?: string;
  upazila?: string;
  union?: string;
  text: string;
  start: string;
  end: string;
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

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred.");
      }

      const data = await response.json();

      // ✅ Ensure correct event formatting
      const formattedTasks = data.records.map((task: Task) => ({
        id: task.id,
        text: task.title,
        start: new Date(task.date).toISOString().split("T")[0], // ✅ Ensure YYYY-MM-DD format
        end: new Date(task.date).toISOString().split("T")[0],
      }));

      setTasks(formattedTasks);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching tasks:", error.message);
        toast.error(`Error: ${error.message}`);
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred.");
      }
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;

    // ✅ Ensure selected date is in YYYY-MM-DD format
    const formattedDate = date.toISOString().split("T")[0];

    setSelectedTask(null);
    setSelectedDate(formattedDate); // ✅ Pass correct date format
    setIsOpen(true);
    setIsEditing(false);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTask.id }), // ✅ Ensure task ID is sent
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task.");
      }

      toast.success("Task deleted successfully");
      fetchTasks(); // ✅ Refresh task list after deletion
      setSelectedTask(null); // ✅ Close modal after deletion
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting task:", error.message);
        toast.error(`Error: ${error.message}`);
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSelectedTask(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">To-Do List Calendar</h2>

      {/* Navigation & Current Month Display */}
      <div className="flex mb-2 gap-2 items-center">
        <button
          className="bg-[#227f9b] text-white px-4 py-2 rounded"
          aria-label="Previous Month"
          onClick={() => setStartDate(startDate.addMonths(-1))}
        >
          <FaArrowLeft />
        </button>
        <p className="bg-[#227f9b] text-white px-4 py-2 rounded">
          {startDate.toString("MMMM yyyy")}
        </p>
        <button
          className="bg-[#227f9b] text-white px-4 py-2 rounded"
          aria-label="Next Month"
          onClick={() => setStartDate(startDate.addMonths(1))}
        >
          <FaArrowRight />
        </button>
      </div>

      {/* Calendar Component */}
      <DayPilotMonth
        startDate={startDate}
        onTimeRangeSelected={(args) =>
          handleDateClick(new Date(args.start.toString()))
        }
        events={tasks.map((task) => ({
          id: task.id,
          text: task.text,
          start: task.start, // ✅ Ensure `start` is a valid date
          end: task.end,
        }))}
        onEventClick={(args) => {
          const task = tasks.find((t) => t.id === args.e.id());
          if (task) setSelectedTask(task);
        }}
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white m-4 p-6 rounded-lg shadow-lg max-w-[60vh] max-h-[70vh] overflow-y-auto z-10">
            <h3 className="text-xl font-semibold mb-4">Task Details</h3>
            <p>
              <strong>Title:</strong> {selectedTask.title}
            </p>
            <p>
              <strong>Added By:</strong> {selectedTask.email}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(`1970-01-01T${selectedTask.time}`).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
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
                aria-label="Close Task Modal"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
              {selectedTask.email === userEmail && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
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
