"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import TaskForm from "./ToDoTaskForm";
import { DayPilotMonth } from "@daypilot/daypilot-lite-react";

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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleDateClick = (args: any) => {
    const date = new Date(args.start.value);
    const today = new Date().setHours(0, 0, 0, 0);

    if (date.getTime() < today) {
      toast.error("You cannot select a past date.");
      return;
    }

    setSelectedDate(date);
    setIsOpen(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">To-Do List Calendar</h2>
      <DayPilotMonth
        onTimeRangeSelected={handleDateClick}
        events={tasks.map((task) => ({
          id: task.date,
          text: task.title,
          start: task.date,
          end: task.date,
        }))}
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
    </div>
  );
};

export default TodoListCalendar;
