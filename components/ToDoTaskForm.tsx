"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import JoditEditorComponent from "./richTextEditor";
import { useSession } from "@/lib/auth-client";

interface Task {
  email: string;
  date: string;
  title: string;
  time: string;
  visibility: string;
  description: string;
  id: string;
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
  const [taskState, setTaskState] = useState<Task>({
    id: taskData?.id || "",
    email: userEmail,
    date: selectedDate || "",
    title: taskData?.title || "",
    time: taskData?.time || "",
    visibility: taskData?.visibility || "private",
    description: taskData?.description || "",
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
      });
    }
  }, [taskData, selectedDate, userEmail]);

  const handleSubmit = async () => {
    if (!taskState.title || !taskState.time || !taskState.description) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const response = await fetch("/api/todo", {
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

      <Input
        type="text"
        placeholder="Title"
        value={taskState.title}
        onChange={(e) => setTaskState({ ...taskState, title: e.target.value })}
      />

      <Input
        type="time"
        value={taskState.time}
        onChange={(e) => setTaskState({ ...taskState, time: e.target.value })}
      />

      {/* Role-based visibility selection */}
      <select
        className="w-full border p-2 rounded mt-2"
        value={taskState.visibility}
        onChange={(e) =>
          setTaskState({ ...taskState, visibility: e.target.value })
        }
        disabled={userRole !== "centraladmin"}
      >
        <option value="private">Private</option>
        {userRole === "centraladmin" && <option value="public">Public</option>}
      </select>

      <JoditEditorComponent
        placeholder="Task Details..."
        initialValue={taskState.description}
        onContentChange={(content) =>
          setTaskState({ ...taskState, description: content })
        }
      />

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

// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import JoditEditorComponent from "./richTextEditor";

// interface Task {
//   email: string;
//   date: string;
//   title: string;
//   time: string;
//   visibility: string;
//   description: string;
//   id: string;
// }

// interface TaskFormProps {
//   userEmail: string;
//   selectedDate: string | null;
//   setIsOpen: (isOpen: boolean) => void;
//   fetchTasks: () => void;
//   taskData?: Task | null;
//   setIsEditing?: (isEditing: boolean) => void;
// }

// const TaskForm: React.FC<TaskFormProps> = ({
//   userEmail,
//   selectedDate,
//   setIsOpen,
//   fetchTasks,
//   taskData = null,
//   setIsEditing,
// }) => {
//   const [taskState, setTaskState] = useState<Task>({
//     id: taskData?.id || "",
//     email: userEmail,
//     date: selectedDate || "",
//     title: taskData?.title || "",
//     time: taskData?.time || "",
//     visibility: taskData?.visibility || "private",
//     description: taskData?.description || "",
//   });

//   useEffect(() => {
//     if (taskData) {
//       setTaskState({
//         id: taskData.id,
//         email: taskData.email,
//         date: taskData.date,
//         title: taskData.title,
//         time: taskData.time,
//         visibility: taskData.visibility,
//         description: taskData.description,
//       });
//     } else {
//       setTaskState({
//         id: "",
//         email: userEmail,
//         date: selectedDate || "",
//         title: "",
//         time: "",
//         visibility: "private",
//         description: "",
//       });
//     }
//   }, [taskData, selectedDate, userEmail]);

//   const handleSubmit = async () => {
//     if (!taskState.title || !taskState.time || !taskState.description) {
//       toast.error("All fields are required.");
//       return;
//     }

//     try {
//       const response = await fetch("/api/todo", {
//         method: taskData ? "PUT" : "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...taskState,
//           id: taskData ? taskData.id : undefined,
//         }), // ✅ Include ID for PUT requests //taskState
//       });

//       if (response.ok) {
//         toast.success(
//           taskData ? "Task updated successfully!" : "Task added successfully!"
//         );
//         fetchTasks();
//         setIsOpen(false);
//         if (setIsEditing) setIsEditing(false);
//       } else {
//         toast.error("Failed to save task.");
//       }
//     } catch (error) {
//       console.error("Error saving task:", error);
//       toast.error("An error occurred. Try again.");
//     }
//   };

//   return (
//     <div className="modal bg-white space-y-4 p-6 m-4 max-h-[80vh] overflow-y-auto rounded-lg shadow-lg">
//       <h3 className="text-xl font-semibold mb-4">
//         {taskData ? "Edit Task" : "Add Task"}
//       </h3>

//       <Input
//         type="text"
//         placeholder="Title"
//         value={taskState.title}
//         onChange={(e) => setTaskState({ ...taskState, title: e.target.value })}
//       />

//       <Input
//         type="time"
//         value={taskState.time}
//         onChange={(e) => setTaskState({ ...taskState, time: e.target.value })}
//       />

//       <select
//         className="w-full border p-2 rounded mt-2"
//         value={taskState.visibility}
//         onChange={(e) =>
//           setTaskState({ ...taskState, visibility: e.target.value })
//         }
//       >
//         <option value="private">Private</option>
//         <option value="public">Public</option>
//       </select>

//       <JoditEditorComponent
//         placeholder="Task Details..."
//         initialValue={taskState.description}
//         onContentChange={(content) =>
//           setTaskState({ ...taskState, description: content })
//         }
//       />

//       <div className="flex justify-end mt-4">
//         <Button onClick={handleSubmit}>
//           {taskData ? "Update Task" : "Submit"}
//         </Button>
//         <Button
//           variant="outline"
//           onClick={() => {
//             setIsOpen(false);
//             if (setIsEditing) setIsEditing(false);
//           }}
//           className="ml-2"
//         >
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default TaskForm;
