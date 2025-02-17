"use client"; //Estiak

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import JoditEditorComponent from "./richTextEditor";
import { useSession } from "@/lib/auth-client";

interface Task {
  id: string;
  email: string;
  creatorRole: string; // <-- store the role of the creator
  date: string;
  title: string;
  time: string;
  visibility: string; // "private" or "public"
  description: string;
  division?: string;
  district?: string;
  area?: string;
  upazila?: string;
  union?: string;
}

interface TaskFormProps {
  userEmail: string;
  userRole: string;
  selectedDate: string | " ";
  setIsOpen: (isOpen: boolean) => void;
  fetchTasks: () => void;
  taskData?: Task | null;
  setIsEditing?: (isEditing: boolean) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  userEmail,
  userRole,
  selectedDate,
  setIsOpen,
  fetchTasks,
  taskData = null,
  setIsEditing,
}) => {
  const { data: session } = useSession();
  const titleRef = useRef<HTMLInputElement>(null);

  const [taskState, setTaskState] = useState<Task>({
    id: taskData?.id || "",
    email: taskData?.email || userEmail, // who posted
    creatorRole: taskData?.creatorRole || userRole, // store role of the creator
    date: taskData?.date || selectedDate || "",
    title: taskData?.title || "",
    time: taskData?.time || "",
    visibility: taskData?.visibility || "private",
    description: taskData?.description || "",
    division: taskData?.division || session?.user?.division || "",
    district: taskData?.district || session?.user?.district || "",
    area: taskData?.area || session?.user?.area || "",
    upazila: taskData?.upazila || session?.user?.upazila || "",
    union: taskData?.union || session?.user?.union || "",
  });

  // Autofocus title
  useEffect(() => {
    if (titleRef.current) titleRef.current.focus();
  }, []);

  // If incoming taskData changes, re-sync:
  useEffect(() => {
    if (taskData) {
      setTaskState((prev) => ({
        ...prev,
        id: taskData.id,
        email: taskData.email,
        creatorRole: taskData.creatorRole,
        date: taskData.date,
        title: taskData.title,
        time: taskData.time,
        visibility: taskData.visibility,
        description: taskData.description,
        division: taskData.division || session?.user?.division || "",
        district: taskData.district || session?.user?.district || "",
        area: taskData.area || session?.user?.area || "",
        upazila: taskData.upazila || session?.user?.upazila || "",
        union: taskData.union || session?.user?.union || "",
      }));
    }
  }, [taskData, session]);

  const handleSubmit = async () => {
    if (!taskState.title || !taskState.time || !taskState.description) {
      toast.error("Title, time, and description are required.");
      return;
    }

    // Validate date
    const chosenDate = taskState.date || selectedDate;

    if (!chosenDate) {
      toast.error("Please select a date.");
      return;
    }
    const parsed = new Date(chosenDate);
    const isoDate = isNaN(parsed.getTime())
      ? new Date().toISOString()
      : parsed.toISOString();

    try {
      const response = await fetch("/api/tasks", {
        method: taskData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskState,
          date: isoDate,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save task.");
      }

      toast.success(taskData ? "Task updated!" : "Task created!");
      fetchTasks();
      setIsOpen(false);
      if (setIsEditing) setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="modal bg-white space-y-4 p-6 m-4 max-h-[80vh] overflow-y-auto rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">
        {taskData ? "Edit Task" : "Add Task"}
      </h3>

      {/* Title */}
      <Input
        ref={titleRef}
        type="text"
        placeholder="Task Title"
        value={taskState.title}
        onChange={(e) => setTaskState({ ...taskState, title: e.target.value })}
      />

      {/* Time */}
      <Input
        type="time"
        value={taskState.time}
        onChange={(e) => setTaskState({ ...taskState, time: e.target.value })}
      />

      {/* Visibility */}
      <select
        className="w-full border p-2 rounded mt-2"
        value={taskState.visibility}
        onChange={(e) =>
          setTaskState({ ...taskState, visibility: e.target.value })
        }
        // daye cannot create public
        disabled={userRole === "daye"}
      >
        <option value="private">Private</option>
        {userRole !== "daye" && <option value="public">Public</option>}
      </select>

      {/* Description (rich text) */}
      <JoditEditorComponent
        placeholder="Task Details..."
        initialValue={taskState.description}
        onContentChange={(content) =>
          setTaskState({ ...taskState, description: content })
        }
      />

      {/* Hidden region fields if needed */}
      <input type="hidden" value={taskState.division} />
      <input type="hidden" value={taskState.district} />
      <input type="hidden" value={taskState.upazila} />
      <input type="hidden" value={taskState.union} />

      {/* Buttons */}
      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit}>{taskData ? "Update" : "Create"}</Button>
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
