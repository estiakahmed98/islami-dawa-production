"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import JoditEditorComponent from "./richTextEditor";

interface TaskFormProps {
  userEmail: string;
  selectedDate: Date | null;
  setIsOpen: (isOpen: boolean) => void;
  fetchTasks: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  userEmail,
  selectedDate,
  setIsOpen,
  fetchTasks,
}) => {
  const [taskData, setTaskData] = useState({
    title: "",
    time: "",
    visibility: "private",
    description: "",
  });

  const handleSubmit = async () => {
    if (!taskData.title || !taskData.time || !taskData.description) {
      toast.error("All fields are required.");
      return;
    }

    const newTask = {
      email: userEmail,
      date: selectedDate?.toISOString().split("T")[0] || "",
      ...taskData,
    };

    try {
      const response = await fetch("/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (response.ok) {
        toast.success("Task added successfully!");
        fetchTasks();
        setIsOpen(false);
      } else {
        toast.error("Failed to add task.");
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("An error occurred. Try again.");
    }
  };

  return (
    <div className="modal bg-white space-y-4 p-6 m-4 max-h-[80vh] overflow-y-auto rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Add Task</h3>
      <Input
        type="text"
        placeholder="Title"
        value={taskData.title}
        onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
      />
      <Input
        type="time"
        value={taskData.time}
        onChange={(e) => setTaskData({ ...taskData, time: e.target.value })}
      />
      <select
        className="w-full border p-2 rounded mt-2"
        value={taskData.visibility}
        onChange={(e) =>
          setTaskData({ ...taskData, visibility: e.target.value })
        }
      >
        <option value="private">Private</option>
        <option value="public">Public</option>
      </select>
      <JoditEditorComponent
        placeholder="Task Details..."
        initialValue={taskData.description}
        onContentChange={(content) =>
          setTaskData({ ...taskData, description: content })
        }
      />
      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit}>Submit</Button>
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          className="ml-2"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TaskForm;
