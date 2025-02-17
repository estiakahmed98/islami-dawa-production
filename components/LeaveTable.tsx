"use client"; //Estiak

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
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
  approvedBy: string;
  status: string;
}

const LeaveTable: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || ""; // ✅ Get logged-in user's email

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (userEmail) {
      fetchLeaves();
    }
  }, [userEmail]);

  const fetchLeaves = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(`/api/leaves?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();

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

  const handleEdit = (leave: LeaveRecord) => {
    setSelectedLeave(leave); // ✅ Always set the selected leave
    setShowForm(true); // ✅ Open the form modal
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">ছুটি বিষয়</h2>
        <Button onClick={() => setShowForm(true)}>+ ছুটির আবেদন করুন</Button>
      </div>

      {/* Leave Form Modal */}
      {showForm && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="z-30 max-w-[95vh] max-h-[70vh] overflow-y-auto">
            <LeaveForm
              onClose={() => {
                setShowForm(false);
                setSelectedLeave(null);
              }}
              onRefresh={fetchLeaves}
              existingData={selectedLeave} // ✅ Pass existing leave data for editing
              userEmail={userEmail}
              // ✅ Pass the logged-in user's email
            />
          </div>
        </div>
      )}

      {/* Table */}
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
                      variant="ghost"
                      className="text-white font-bold"
                      onClick={() => handleEdit(leave)}
                    >
                      {leave.status === "Pending" ? "Edit" : "Show"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
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
