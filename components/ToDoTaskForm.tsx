"use client";

import { useState, useEffect, useRef } from "react";
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
  upazila?: string;
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
  const { data: session } = useSession(); // Get session data
  const titleInputRef = useRef<HTMLInputElement>(null);

  // State to manage the task form fields
  const [taskState, setTaskState] = useState<Task>({
    id: taskData?.id || "",
    email: userEmail,
    date: selectedDate || "",
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

  // Auto-focus on the title field
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Update state when `taskData` changes
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
        division: taskData.division || session?.user?.division || "",
        district: taskData.district || session?.user?.district || "",
        area: taskData.area || session?.user?.area || "",
        upazila: taskData.upazila || session?.user?.upazila || "",
        union: taskData.union || session?.user?.union || "",
      });
    }
  }, [taskData, session]);

  // Form submission
  const handleSubmit = async () => {
    if (!taskState.title || !taskState.time || !taskState.description) {
      toast.error("All fields are required.");
      return;
    }

    // ✅ Ensure selectedDate is not null
    const selectedTaskDate = taskState.date || selectedDate;
    if (!selectedTaskDate) {
      toast.error("Please select a date.");
      return;
    }

    // ✅ Combine selectedDate and time properly
    const fullDateTime = `${selectedTaskDate}T${taskState.time}:00`;

    try {
      const response = await fetch("/api/tasks", {
        method: taskData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskState,
          date: fullDateTime, // ✅ Ensure correct datetime format
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save task.");
      }

      toast.success(
        taskData ? "Task updated successfully!" : "Task added successfully!"
      );
      fetchTasks();
      setIsOpen(false);
      if (setIsEditing) setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving task:", error.message);
        toast.error(`Error: ${error.message}`);
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="modal bg-white space-y-4 p-6 m-4 max-h-[80vh] overflow-y-auto rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">
        {taskData ? "Edit Task" : "Add Task"}
      </h3>

      {/* Title Input */}
      <Input
        ref={titleInputRef}
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

      {/* Auto-filled Fields from Session (Hidden from user) */}
      <input type="hidden" value={taskState.division} />
      <input type="hidden" value={taskState.district} />
      <input type="hidden" value={taskState.area} />
      <input type="hidden" value={taskState.upazila} />
      <input type="hidden" value={taskState.union} />

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end mt-4">
        <Button aria-label="Submit Task" onClick={handleSubmit}>
          {taskData ? "Update Task" : "Submit"}
        </Button>
        <Button
          variant="outline"
          aria-label="Cancel Task Form"
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
