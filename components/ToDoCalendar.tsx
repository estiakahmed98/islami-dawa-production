"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import TaskForm from "./ToDoTaskForm";
import { DayPilotMonth, DayPilot } from "@daypilot/daypilot-lite-react";

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

  const handleDateClick = (args: { start: DayPilot.Date }) => {
    const date = args.start.toString();
    const today = DayPilot.Date.today().toString();

    if (date < today) {
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
        startDate={startDate}
        onTimeRangeSelected={handleDateClick}
        onBeforeCellRender={(args) => {
          const cellDate = args.cell.start.toString();
          const task = tasks.find((task) => task.date === cellDate);
          if (task) {
            args.cell.properties.headerHtml = `<div class='bg-green-500 text-white p-1 rounded'>${task.title}</div>`;
          }
        }}
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-[600px] z-10">
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
