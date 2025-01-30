"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import JoditEditorComponent from "./richTextEditor";
import { useSession } from "@/lib/auth-client";

interface Task {
  id: string;
  email: string;
  date: string;
  title: string;
  time: string;
  visibility: string;
  description: string;
  division?: string;
  district?: string;
  area?: string;
  upozila?: string;
  union?: string;
}

interface TaskFormProps {
  userEmail: string;
  userRole: string;
  selectedDate: string | null;
  setIsOpen: (isOpen: boolean) => void;
  fetchTasks: () => void;
  taskData?: Task | null;
  setIsEditing?: (isEditing: boolean) => void;
  userDivision?: string;
  userDistrict?: string;
  userArea?: string;
  userUpozila?: string;
  userUnion?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  userEmail,
  userRole,
  selectedDate,
  setIsOpen,
  fetchTasks,
  taskData = null,
  setIsEditing,
  userDivision,
  userDistrict,
  userArea,
  userUpozila,
  userUnion,
}) => {
  const [taskState, setTaskState] = useState<Task>({
    id: taskData?.id || "",
    email: userEmail,
    date: selectedDate || "",
    title: taskData?.title || "",
    time: taskData?.time || "",
    visibility: taskData?.visibility || "private",
    description: taskData?.description || "",
    division: userDivision,
    district: userDistrict,
    area: userArea,
    upozila: userUpozila,
    union: userUnion,
  });

  useEffect(() => {
    if (taskData) {
      setTaskState({
        id: taskData.id,
        email: taskData.email,
        date: taskData.date,
        title: taskData.title,
        time: taskData.time,
        visibility: taskData.visibility,
        description: taskData.description,
        division: taskData.division,
        district: taskData.district,
        area: taskData.area,
        upozila: taskData.upozila,
        union: taskData.union,
      });
    } else {
      setTaskState({
        id: "",
        email: userEmail,
        date: selectedDate || "",
        title: "",
        time: "",
        visibility: "private",
        description: "",
        division: userDivision,
        district: userDistrict,
        area: userArea,
        upozila: userUpozila,
        union: userUnion,
      });
    }
  }, [
    taskData,
    selectedDate,
    userEmail,
    userDivision,
    userDistrict,
    userArea,
    userUpozila,
    userUnion,
  ]);

  const handleSubmit = async () => {
    if (!taskState.title || !taskState.time || !taskState.description) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: taskData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskState,
          id: taskData ? taskData.id : undefined,
        }),
      });

      if (response.ok) {
        toast.success(
          taskData ? "Task updated successfully!" : "Task added successfully!"
        );
        fetchTasks();
        setIsOpen(false);
        if (setIsEditing) setIsEditing(false);
      } else {
        toast.error("Failed to save task.");
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("An error occurred. Try again.");
    }
  };

  return (
    <div className="modal bg-white space-y-4 p-6 m-4 max-h-[80vh] overflow-y-auto rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">
        {taskData ? "Edit Task" : "Add Task"}
      </h3>

      {/* Title Input */}
      <Input
        type="text"
        placeholder="Title"
        value={taskState.title}
        onChange={(e) => setTaskState({ ...taskState, title: e.target.value })}
      />

      {/* Time Input */}
      <Input
        type="time"
        value={taskState.time}
        onChange={(e) => setTaskState({ ...taskState, time: e.target.value })}
      />

      {/* Visibility Select */}
      <select
        className="w-full border p-2 rounded mt-2"
        value={taskState.visibility}
        onChange={(e) =>
          setTaskState({ ...taskState, visibility: e.target.value })
        }
        disabled={userRole === "daye"} // Only dayee can add private tasks
      >
        <option value="private">Private</option>
        {userRole !== "daye" && <option value="public">Public</option>}
      </select>

      {/* Rich Text Editor for Description */}
      <JoditEditorComponent
        placeholder="Task Details..."
        initialValue={taskState.description}
        onContentChange={(content) =>
          setTaskState({ ...taskState, description: content })
        }
      />

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit}>
          {taskData ? "Update Task" : "Submit"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsOpen(false);
            if (setIsEditing) setIsEditing(false);
          }}
          className="ml-2"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TaskForm;
