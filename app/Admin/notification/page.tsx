"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface LeaveRecord {
  email: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  approvedBy: string;
  status: string;
  date: string;
  index: number;
}

const AdminNotifications: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRecord[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notification");
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data.leaveRequests);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const updateStatus = async (
    email: string,
    date: string,
    index: number,
    status: string
  ) => {
    try {
      const response = await fetch("/api/notification", {
        method: "POST",
        body: JSON.stringify({ email, date, index, status }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Admin Notifications</h2>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-black">Email</TableHead>
              <TableHead className="font-bold text-black">Type</TableHead>
              <TableHead className="font-bold text-black">From</TableHead>
              <TableHead className="font-bold text-black">To</TableHead>
              <TableHead className="font-bold text-black">Days</TableHead>
              <TableHead className="font-bold text-black">Reason</TableHead>
              <TableHead className="font-bold text-black">Status</TableHead>
              <TableHead className="font-bold text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.length > 0 ? (
              leaveRequests.map((leave, index) => (
                <TableRow key={index}>
                  <TableCell>{leave.email}</TableCell>
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
                    <select
                      value={leave.status}
                      onChange={(e) =>
                        updateStatus(
                          leave.email,
                          leave.date,
                          leave.index,
                          e.target.value
                        )
                      }
                      className="border rounded-md p-2"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No leave requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminNotifications;

// "use client";

// import { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";

// interface LeaveRecord {
//   email: string;
//   leaveType: string;
//   from: string;
//   to: string;
//   days: number;
//   reason: string;
//   approvedBy: string;
//   status: string;
//   date: string;
//   index: number;
// }

// const AdminNotifications: React.FC = () => {
//   const [leaveRequests, setLeaveRequests] = useState<LeaveRecord[]>([]);

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const response = await fetch("/api/notification");
//       if (response.ok) {
//         const data = await response.json();
//         setLeaveRequests(data.leaveRequests);
//       }
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   const updateStatus = async (
//     email: string,
//     date: string,
//     index: number,
//     status: string
//   ) => {
//     try {
//       const response = await fetch("/api/notification", {
//         method: "POST",
//         body: JSON.stringify({ email, date, index, status }),
//         headers: { "Content-Type": "application/json" },
//       });

//       if (response.ok) {
//         fetchNotifications();
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-2xl font-semibold mb-4">Admin Notifications</h2>
//       <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Email</TableHead>
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
//             {leaveRequests.length > 0 ? (
//               leaveRequests.map((leave, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{leave.email}</TableCell>
//                   <TableCell>{leave.leaveType}</TableCell>
//                   <TableCell>{leave.from}</TableCell>
//                   <TableCell>{leave.to}</TableCell>
//                   <TableCell>{leave.days}</TableCell>
//                   <TableCell>{leave.reason}</TableCell>
//                   <TableCell>
//                     <select
//                       value={leave.status}
//                       onChange={(e) =>
//                         updateStatus(
//                           leave.email,
//                           leave.date,
//                           leave.index,
//                           e.target.value
//                         )
//                       }
//                       className="border rounded-md p-2 bg-green-500 "
//                     >
//                       <option value="Pending">Pending</option>
//                       <option value="Approved">Approved</option>
//                       <option value="Rejected">Rejected</option>
//                     </select>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={8} className="text-center text-gray-500">
//                   No leave requests found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default AdminNotifications;
