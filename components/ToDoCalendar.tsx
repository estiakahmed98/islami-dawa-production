"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import TaskForm from "./ToDoTaskForm";
import { DayPilotMonth, DayPilot } from "@daypilot/daypilot-lite-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface Task {
  id: string;
  email: string;
  date: string;
  title: string;
  time: string;
  visibility: string;
  description: string;
}

const TodoListCalendar = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const userRole = session?.user?.role || "";

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [startDate, setStartDate] = useState(DayPilot.Date.today().addDays(2));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [startDate]);

  // Fetch tasks from the API
  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.records);
      } else {
        toast.error("Failed to fetch tasks.");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("An error occurred. Try again.");
    }
  };

  // Handle date selection
  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;
    const selectedDateTimestamp = date.getTime();
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    if (selectedDateTimestamp < todayTimestamp) {
      toast.error("You cannot select a past date.");
      return;
    }

    setSelectedTask(null);
    setSelectedDate(date.toISOString().split("T")[0]);
    setIsOpen(true);
    setIsEditing(false);
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks?id=${selectedTask.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
        fetchTasks();
        setSelectedTask(null); // Close task details modal
      } else {
        toast.error("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("An error occurred. Try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">To-Do List Calendar</h2>

      {/* Navigation & Current Month Display */}
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

      {/* Calendar Component */}
      <DayPilotMonth
        startDate={startDate}
        onTimeRangeSelected={(args) =>
          handleDateClick(new Date(args.start.toString()))
        }
        events={tasks.map((task) => ({
          id: task.id,
          text: task.title,
          start: task.date,
          end: task.date,
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
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
              {/* Edit Button */}
              {selectedTask.email === userEmail && (
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
              )}
              {/* Delete Button */}
              {selectedTask.email === userEmail && (
                <button
                  className="bg-red-700 text-white px-4 py-2 rounded"
                  onClick={handleDeleteTask}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {isOpen && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div>
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
        </div>
      )}
    </div>
  );
};

export default TodoListCalendar;
