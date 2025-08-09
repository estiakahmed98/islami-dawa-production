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

  if (loading) {
    return (
      <Card className="w-full mx-auto shadow-lg border-purple-200">
        <CardHeader className="bg-sky-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Your Leave Applications</CardTitle>
          <CardDescription className="text-purple-100">
            Overview of your submitted leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Loading leave requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full mx-auto shadow-lg border-red-200">
        <CardHeader className="bg-red-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Your Leave Applications</CardTitle>
          <CardDescription className="text-red-100">
            Overview of your submitted leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-red-500 text-center">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto shadow-lg border-purple-200">
      <CardHeader className="bg-sky-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Your Leave Applications</CardTitle>
        <CardDescription className="text-purple-100">
          Overview of your submitted leave requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {leaveRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No leave requests found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50">
                  <TableHead className="text-purple-800">Type</TableHead>
                  <TableHead className="text-purple-800">From</TableHead>
                  <TableHead className="text-purple-800">To</TableHead>
                  <TableHead className="text-purple-800">Days</TableHead>
                  <TableHead className="text-purple-800">Reason</TableHead>
                  <TableHead className="text-purple-800">Status</TableHead>
                  <TableHead className="text-purple-800">
                    Requested On
                  </TableHead>
                  <TableHead className="text-purple-800">Approved By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-purple-50">
                    <TableCell className="font-medium capitalize">
                      {request.leaveType}
                    </TableCell>
                    <TableCell>
                      {new Date(request.fromDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(request.toDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {request.reason}
                    </TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.approvedBy || "N/A"}</TableCell>
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
