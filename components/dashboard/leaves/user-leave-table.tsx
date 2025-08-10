"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "lucide-react";
import { toast } from "sonner";

interface LeaveRequest {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: string;
  requestDate: string;
  approvedBy?: string | null;
}

interface UserLeaveTableProps {
  userEmail: string;
  refetch: number; // A simple number to trigger refetch when it changes
}

export function UserLeaveTable({ userEmail, refetch }: UserLeaveTableProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/leaves?email=${userEmail}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch leave requests.");
      }
      setLeaveRequests(data.leaveRequests);
    } catch (err: any) {
      setError(err.message);
      toast.error(
        `Error fetching leaves: ${err.message || "An unexpected error occurred."}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchLeaveRequests();
    }
  }, [userEmail, refetch]); // Re-fetch when userEmail or refetch prop changes

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRowBackgroundClass = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "approved":
        return "bg-emerald-50 hover:bg-emerald-100 border-l-4 border-l-emerald-400";
      case "rejected":
        return "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400";
      case "pending":
        return "bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-400";
      default:
        return "bg-white hover:bg-gray-50";
    }
  };

  if (loading) {
    return (
      <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <CardTitle className="text-3xl font-bold">
            Your Leave Applications
          </CardTitle>
          <CardDescription className="text-indigo-100 mt-2">
            Overview of your submitted leave requests and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="ml-4 text-gray-600 text-lg">
              Loading your leave requests...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
          <CardTitle className="text-3xl font-bold">
            Your Leave Applications
          </CardTitle>
          <CardDescription className="text-red-100 mt-2">
            There was an issue loading your leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 text-center text-lg">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sm:p-2 md:p-6">
        <CardTitle className="text-3xl font-bold">
          Your Leave Applications
        </CardTitle>
        <CardDescription className="text-indigo-100 mt-2">
          Overview of your submitted leave requests and their current status.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        {/* Summary Statistics */}
        {leaveRequests.length > 0 && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-emerald-800 font-semibold text-lg">
                {
                  leaveRequests.filter(
                    (req) => req.status.toLowerCase() === "approved"
                  ).length
                }
              </div>
              <div className="text-emerald-600 text-sm">Approved Requests</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-amber-800 font-semibold text-lg">
                {
                  leaveRequests.filter(
                    (req) => req.status.toLowerCase() === "pending"
                  ).length
                }
              </div>
              <div className="text-amber-600 text-sm">Pending Requests</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-semibold text-lg">
                {
                  leaveRequests.filter(
                    (req) => req.status.toLowerCase() === "rejected"
                  ).length
                }
              </div>
              <div className="text-red-600 text-sm">Rejected Requests</div>
            </div>
          </div>
        )}

        {leaveRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">No leave requests found.</p>
              <p className="text-gray-400 text-sm mt-2">
                Your submitted leave applications will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-cyan-600 to-teal-700 text-white border-b-2 border-gray-200">
                  <TableHead className="font-bold text-white py-4 px-6">
                    Leave Type
                  </TableHead>
                  <TableHead className="font-bold text-white py-4 px-6">
                    From Date
                  </TableHead>
                  <TableHead className="font-bold text-white py-4 px-6">
                    To Date
                  </TableHead>
                  <TableHead className="font-bold text-white py-4 px-6">
                    Days
                  </TableHead>
                  <TableHead className="font-bold text-white py-4 px-6">
                    Reason
                  </TableHead>
                  <TableHead className="font-bold text-white py-4 px-6">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-white py-4 px-6">
                    Requested On
                  </TableHead>
                  <TableHead className="font-bold text-white py-4 px-6">
                    Approved By
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((request, index) => (
                  <TableRow
                    key={request.id}
                    className={`transition-all duration-200 ${getRowBackgroundClass(request.status)}`}
                  >
                    <TableCell className="font-semibold capitalize py-4 px-6 text-gray-800">
                      {request.leaveType}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {new Date(request.fromDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {new Date(request.toDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-800 font-medium">
                      {request.days}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700 max-w-[250px]">
                      <div className="truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(request.status)}`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {new Date(request.requestDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-gray-700">
                      {request.approvedBy ? (
                        <span className="font-medium">
                          {request.approvedBy}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Pending</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
