"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import LeaveForm from "./LeaveForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaveRecord {
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: string;
}

const LeaveTable: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [userEmail]);

  const fetchLeaves = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`/api/leaves?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();

        // Ensure correct typing when extracting the array
        const allLeaves: LeaveRecord[] = Object.values(data.leaveRequests || {})
          .flat()
          .filter(
            (leave): leave is LeaveRecord =>
              typeof leave === "object" &&
              leave !== null &&
              "leaveType" in leave &&
              "from" in leave &&
              "to" in leave &&
              "days" in leave &&
              "reason" in leave &&
              "status" in leave
          );

        setLeaves(allLeaves);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  const handleDelete = async (date: string, index: number) => {
    try {
      const response = await fetch("/api/leaves", {
        method: "DELETE",
        body: JSON.stringify({ email: userEmail, date, index }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchLeaves();
      }
    } catch (error) {
      console.error("Error deleting leave:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Leave Records</h2>
        <Button onClick={() => setShowForm(true)}>+ Apply for Leave</Button>
      </div>

      {/* Leave Form Modal */}
      {showForm && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-[600px] z-10">
            <LeaveForm
              onClose={() => setShowForm(false)}
              onRefresh={fetchLeaves}
            />
          </div>
        </div>
      )}

      {/* ShadCN Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length > 0 ? (
              leaves.map((leave, index) => (
                <TableRow key={index}>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>{leave.from}</TableCell>
                  <TableCell>{leave.to}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-md text-sm font-semibold ${
                        leave.status === "Pending"
                          ? "bg-red-200 text-red-700"
                          : leave.status === "Approved"
                          ? "bg-green-500 text-white"
                          : "bg-red-800 text-white"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(leave.from, index)}
                      className="bg-red-400 text-white font-extrabold"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No leave records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeaveTable;

// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { Button } from "@/components/ui/button";
// import LeaveForm from "./LeaveForm";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// interface LeaveRecord {
//   leaveType: string;
//   from: string;
//   to: string;
//   days: number;
//   reason: string;
//   status: string;
// }

// const LeaveTable: React.FC = () => {
//   const { data: session } = useSession();
//   const userEmail = session?.user?.email || "";
//   const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
//   const [showForm, setShowForm] = useState(false);

//   useEffect(() => {
//     fetchLeaves();
//   }, [userEmail]);

//   const fetchLeaves = async () => {
//     if (!userEmail) return;

//     try {
//       const response = await fetch(`/api/leaves?email=${userEmail}`);
//       if (response.ok) {
//         const data = await response.json();

//         // Ensure correct typing when extracting the array
//         const allLeaves: LeaveRecord[] = Object.values(data.leaveRequests || {})
//           .flat()
//           .filter(
//             (leave): leave is LeaveRecord =>
//               typeof leave === "object" &&
//               leave !== null &&
//               "leaveType" in leave &&
//               "from" in leave &&
//               "to" in leave &&
//               "days" in leave &&
//               "reason" in leave &&
//               "status" in leave
//           );

//         setLeaves(allLeaves);
//       }
//     } catch (error) {
//       console.error("Error fetching leaves:", error);
//     }
//   };

//   const handleDelete = async (date: string, index: number) => {
//     try {
//       const response = await fetch("/api/leaves", {
//         method: "DELETE",
//         body: JSON.stringify({ email: userEmail, date, index }),
//         headers: { "Content-Type": "application/json" },
//       });

//       if (response.ok) {
//         fetchLeaves();
//       }
//     } catch (error) {
//       console.error("Error deleting leave:", error);
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-semibold">Leave Records</h2>
//         <Button onClick={() => setShowForm(true)}>+ Apply for Leave</Button>
//       </div>

//       {/* Leave Form Modal */}
//       {showForm && (
//         <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-[600px] z-10">
//             <LeaveForm
//               onClose={() => setShowForm(false)}
//               onRefresh={fetchLeaves}
//             />
//           </div>
//         </div>
//       )}

//       {/* ShadCN Table */}
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Type</TableHead>
//               <TableHead>From</TableHead>
//               <TableHead>To</TableHead>
//               <TableHead>Days</TableHead>
//               <TableHead>Reason</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {leaves.length > 0 ? (
//               leaves.map((leave, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{leave.leaveType}</TableCell>
//                   <TableCell>{leave.from}</TableCell>
//                   <TableCell>{leave.to}</TableCell>
//                   <TableCell>{leave.days}</TableCell>
//                   <TableCell>{leave.reason}</TableCell>
//                   <TableCell>{leave.status}</TableCell>
//                   <TableCell>
//                     <Button
//                       variant="destructive"
//                       onClick={() => handleDelete(leave.from, index)}
//                       className="bg-red-400 text-white font-extrabold"
//                     >
//                       Delete
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={8} className="text-center text-gray-500">
//                   No leave records found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default LeaveTable;
