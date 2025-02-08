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

  const sendApprovalEmail = async (
    email: string,
    name: string,
    leaveType: string,
    leaveDates: string
  ) => {
    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        body: JSON.stringify({
          action: "leaveApproval",
          email: "faysalmohammed.shah@gmail.com",
          name,
          leaveType,
          leaveDates,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error("Failed to send approval email");
      }
    } catch (error) {
      console.error("Error sending approval email:", error);
    }
  };

  const sendRejectionEmail = async (
    email: string,
    name: string,
    leaveType: string,
    leaveDates: string,
    reason: string
  ) => {
    try {
      console.log("Sending rejection email to", email); // Debug log
      const response = await fetch("/api/emails", {
        method: "POST",
        body: JSON.stringify({
          action: "leaveRejection",
          email: "faysalmohammed.shah@gmail.com",
          name,
          leaveType,
          leaveDates,
          reason,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error("Failed to send rejection email");
      } else {
        console.log("Rejection email sent successfully to", email); // Success log
      }
    } catch (error) {
      console.error("Error sending rejection email:", error);
    }
  };

  const updateStatus = async (
    email: string,
    date: string,
    index: number,
    status: string,
    leaveType: string,
    name: string,
    from: string,
    to: string,
    reason: string
  ) => {
    try {
      const response = await fetch("/api/notification", {
        method: "POST",
        body: JSON.stringify({ email, date, index, status }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchNotifications();
        const leaveDates = `${from} to ${to}`;
        if (status === "Approved") {
          sendApprovalEmail(email, name, leaveType, leaveDates);
        } else if (status === "Rejected") {
          console.log("Rejection triggered"); // Debug log
          sendRejectionEmail(email, name, leaveType, leaveDates, reason);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">ছুটির অনুমতি দিন</h2>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-2">
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
                          e.target.value,
                          leave.leaveType,
                          leave.approvedBy,
                          leave.from,
                          leave.to,
                          leave.reason
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
