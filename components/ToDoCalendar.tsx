"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
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
  id: string;
}

const TodoListCalendar = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const userRole = session?.user?.role || ""; // Get user role

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [startDate, setStartDate] = useState(DayPilot.Date.today().addDays(2));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [startDate]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/todo?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        const allTasks: Task[] = data.records || [];

        // ✅ Show only private tasks of the logged-in user & all public tasks
        const userTasks = allTasks.filter(
          (task) => task.email === userEmail || task.visibility === "public"
        );

        setTasks(userTasks);
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

    setSelectedTask(null);
    setSelectedDate(date.toISOString().split("T")[0]);
    setIsOpen(true);
    setIsEditing(false);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch("/api/todo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTask.id,
        }),
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
        fetchTasks();
        setSelectedTask(null); // Close task details modal
      } else {
        toast.error("Failed to delete task");
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
              {/* ✅ Edit Button */}
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
              {/* ✅ Delete Button */}
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
              userRole={userRole} // Pass user role
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

// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { useSession } from "@/lib/auth-client";
// import TaskForm from "./ToDoTaskForm";
// import { DayPilotMonth, DayPilot } from "@daypilot/daypilot-lite-react";
// import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// interface Task {
//   email: string;
//   date: string;
//   title: string;
//   time: string;
//   visibility: string;
//   description: string;
//   id: string;
// }

// const TodoListCalendar = () => {
//   const { data: session } = useSession();
//   const userEmail = session?.user?.email || "";

//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [startDate, setStartDate] = useState(DayPilot.Date.today());
//   const [isEditing, setIsEditing] = useState(false);

//   useEffect(() => {
//     fetchTasks();
//   }, [startDate]);

//   const fetchTasks = async () => {
//     try {
//       const response = await fetch(`/api/todo?email=${userEmail}`);
//       if (response.ok) {
//         const data = await response.json();
//         const allTasks: Task[] = data.records || [];

//         // ✅ Filter tasks: Show private tasks of logged-in user & public tasks
//         const userTasks = allTasks.filter(
//           (task) => task.email === userEmail || task.visibility === "public"
//         );

//         setTasks(userTasks);
//       }
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//     }
//   };

//   const handleDateClick = (date: Date | undefined) => {
//     if (!date) return;
//     const selectedDateTimestamp = date.getTime();
//     const todayTimestamp = new Date().setHours(0, 0, 0, 0);

//     if (selectedDateTimestamp < todayTimestamp) {
//       toast.error("You cannot select a past date.");
//       return;
//     }

//     setSelectedTask(null);
//     setSelectedDate(date.toISOString().split("T")[0]);
//     setIsOpen(true);
//     setIsEditing(false);
//   };

//   const handleTaskClick = (task: Task) => {
//     setSelectedTask(task);
//   };

//   const handleDeleteTask = async () => {
//     if (!selectedTask) return;

//     try {
//       const response = await fetch("/api/todo", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: selectedTask.id,
//           //   email: selectedTask.email,
//           //   date: selectedTask.date,
//           //   title: selectedTask.title,
//         }),
//       });

//       if (response.ok) {
//         toast.success("Task deleted successfully");
//         fetchTasks();
//         setSelectedTask(null); // Close task details modal
//       } else {
//         toast.error("Failed to delete task");
//       }
//     } catch (error) {
//       console.error("Error deleting task:", error);
//       toast.error("An error occurred. Try again.");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">To-Do List Calendar</h2>

//       {/* Navigation & Current Month Display */}
//       <div className="flex mb-2 gap-2 items-center">
//         <button
//           className="bg-[#227f9b] text-white px-4 py-2 rounded"
//           onClick={() => setStartDate(startDate.addMonths(-1))}
//         >
//           <FaArrowLeft />
//         </button>
//         <p className="bg-[#227f9b] text-white px-4 py-2 rounded">
//           {startDate.toString("MMMM yyyy")}
//         </p>
//         <button
//           className="bg-[#227f9b] text-white px-4 py-2 rounded"
//           onClick={() => setStartDate(startDate.addMonths(1))}
//         >
//           <FaArrowRight />
//         </button>
//       </div>

//       {/* Calendar Component */}
//       <DayPilotMonth
//         startDate={startDate}
//         onTimeRangeSelected={(args) =>
//           handleDateClick(new Date(args.start.toString()))
//         }
//         events={tasks.map((task) => ({
//           id: task.date,
//           text: task.title,
//           start: task.date,
//           end: task.date,
//         }))}
//         onEventClick={(args) => {
//           const task = tasks.find((t) => t.date === args.e.id());
//           if (task) setSelectedTask(task);
//         }}
//       />

//       {/* Task Form Modal */}
//       {(isOpen || isEditing) && (
//         <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-30">
//           <div>
//             <TaskForm
//               userEmail={userEmail}
//               selectedDate={selectedDate}
//               setIsOpen={setIsOpen}
//               fetchTasks={fetchTasks}
//               taskData={isEditing ? selectedTask : null} // ✅ Pass data for editing
//               setIsEditing={setIsEditing}
//             />
//           </div>
//         </div>
//       )}

//       {/* Task Details Modal */}
//       {selectedTask && (
//         <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white m-4 p-6 rounded-lg shadow-lg max-w-[60vh] max-h-[70vh] overflow-y-auto z-10">
//             <h3 className="text-xl font-semibold mb-4">Task Details</h3>
//             <p>
//               <strong>Title:</strong> {selectedTask.title}
//             </p>
//             <p>
//               <strong>Added By:</strong> {selectedTask.email}
//             </p>
//             <p>
//               <strong>Time:</strong>{" "}
//               {new Date(`1970-01-01T${selectedTask.time}`).toLocaleTimeString(
//                 "en-US",
//                 {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                   hour12: true,
//                 }
//               )}
//             </p>
//             <p>
//               <strong>Visibility:</strong> {selectedTask.visibility}
//             </p>
//             <p>
//               <strong>Description:</strong>
//             </p>
//             <div
//               dangerouslySetInnerHTML={{ __html: selectedTask.description }}
//             ></div>
//             <div className="flex justify-between mt-4">
//               <button
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//                 onClick={() => setSelectedTask(null)}
//               >
//                 Close
//               </button>
//               {/* ✅ Edit Button */}
//               {selectedTask.email === userEmail && (
//                 <button
//                   className="bg-yellow-500 text-white px-4 py-2 rounded"
//                   onClick={() => {
//                     setIsEditing(true);
//                     setSelectedDate(selectedTask.date); // ✅ Ensure date is set
//                     setIsOpen(true);
//                   }}
//                 >
//                   Edit
//                 </button>
//               )}
//               {/* ✅ Delete Button */}
//               {selectedTask.email === userEmail && (
//                 <button
//                   className="bg-red-700 text-white px-4 py-2 rounded"
//                   onClick={handleDeleteTask}
//                 >
//                   Delete
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TodoListCalendar;
