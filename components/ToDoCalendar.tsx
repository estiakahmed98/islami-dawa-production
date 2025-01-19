"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import TaskForm from "./ToDoTaskForm";
import { DayPilotMonth, DayPilot } from "@daypilot/daypilot-lite-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface Task {
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

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [startDate, setStartDate] = useState(DayPilot.Date.today());

  useEffect(() => {
    fetchTasks();
  }, [startDate]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/todo");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.records || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;
    const selectedDateTimestamp = date.getTime();
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    if (selectedDateTimestamp < todayTimestamp) {
      toast.error("You cannot select a past date.");
      return;
    }

    setSelectedDate(date.toISOString().split("T")[0]);
    setIsOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">To-Do List Calendar </h2>

      <div className="flex mb-2 gap-2">
        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            className="bg-[#227f9b] text-white px-4 py-2 rounded"
            onClick={() => setStartDate(startDate.addMonths(-1))}
          >
            <FaArrowLeft />
          </button>
          <button
            className="bg-[#227f9b] text-white px-4 py-2 rounded"
            onClick={() => setStartDate(startDate.addMonths(1))}
          >
            <FaArrowRight />
          </button>
        </div>
        <p className=" bg-[#227f9b] text-white px-4 py-2 rounded">
          {startDate.toString("MMMM yyyy")}
        </p>
      </div>

      <DayPilotMonth
        startDate={startDate}
        onTimeRangeSelected={(args) =>
          handleDateClick(new Date(args.start.toString()))
        }
        events={tasks.map((task) => ({
          id: task.date,
          text: task.title,
          start: task.date,
          end: task.date,
        }))}
        onEventClick={(args) => {
          const task = tasks.find((t) => t.date === args.e.id());
          if (task) setSelectedTask(task);
        }}
      />

      {/* Task Form Modal */}
      {isOpen && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div>
            <TaskForm
              userEmail={userEmail}
              selectedDate={selectedDate}
              setIsOpen={setIsOpen}
              fetchTasks={fetchTasks}
            />
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white m-4 p-6 rounded-lg shadow-lg max-w-[60vh] max-h-[70vh] overflow-y-auto z-10">
            <h3 className="text-xl font-semibold mb-4">Task Details</h3>
            <p>
              <strong>Title:</strong> {selectedTask.title}
            </p>
            <p>
              <strong>Time:</strong> {selectedTask.time}
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
            <div className="flex justify-end mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoListCalendar;
