"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge, CheckIcon, XIcon } from "lucide-react"
import { toast } from "sonner";

interface LeaveRequest {
  id: string
  leaveType: string
  fromDate: string
  toDate: string
  days: number
  reason: string
  status: string
  requestDate: string
  approvedBy?: string | null
  user: {
    name?: string | null
    email: string
    phone?: string | null
    division?: string | null
    district?: string | null
    upazila?: string | null
    union?: string | null
  }
}

export function AdminLeaveTable() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchAllLeaveRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/leaves?isAdmin=true")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch all leave requests.")
      }

      setLeaveRequests(data.leaveRequests)
    } catch (err: any) {
      setError(err.message)
      toast.error(`Error fetching leaves: ${err.message || "An unexpected error occurred."}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllLeaveRequests()
  }, [])

  const handleStatusUpdate = async (
    id: string,
    userEmail: string,
    newStatus: "approved" | "rejected",
    approvedBy = "Admin", // Placeholder for admin's name
  ) => {
    setUpdatingId(id)
    try {
      const response = await fetch("/api/leaves", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          email: userEmail, // Important: Pass the user's email for ownership verification
          status: newStatus,
          approvedBy: newStatus === "approved" ? approvedBy : null, // Clear approvedBy if rejected
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${newStatus} leave request.`)
      }

     toast.success(`Leave request ${newStatus} successfully!`)
      fetchAllLeaveRequests() // Re-fetch data to update the table
    } catch (err: any) {
      toast.error(`Error updating leave status: ${err.message || "An unexpected error occurred."}`)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto shadow-lg">
        <CardHeader className="bg-green-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Manage Leave Applications</CardTitle>
          <CardDescription className="text-green-100">
            Review and approve/reject all submitted leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Loading all leave requests...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-6xl mx-auto shadow-lg">
        <CardHeader className="bg-green-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Manage Leave Applications</CardTitle>
          <CardDescription className="text-green-100">
            Review and approve/reject all submitted leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-red-500 text-center">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg">
      <CardHeader className="bg-green-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Manage Leave Applications</CardTitle>
        <CardDescription className="text-green-100">
          Review and approve/reject all submitted leave requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {leaveRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No leave requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50">
                  <TableHead className="text-green-800">Applicant</TableHead>
                  <TableHead className="text-green-800">Contact</TableHead>
                  <TableHead className="text-green-800">Type</TableHead>
                  <TableHead className="text-green-800">Dates</TableHead>
                  <TableHead className="text-green-800">Days</TableHead>
                  <TableHead className="text-green-800">Reason</TableHead>
                  <TableHead className="text-green-800">Status</TableHead>
                  <TableHead className="text-green-800">Requested On</TableHead>
                  <TableHead className="text-green-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-green-50">
                    <TableCell className="font-medium">
                      {request.user.name || "N/A"}
                      <br />
                      <span className="text-sm text-muted-foreground">{request.user.email}</span>
                    </TableCell>
                    <TableCell>
                      {request.user.phone || "N/A"}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {request.user.division}, {request.user.district}
                      </span>
                    </TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>
                      {new Date(request.fromDate).toLocaleDateString()} -{" "}
                      {new Date(request.toDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          request.status === "approved"
                            ? "bg-green-600 text-white"
                            : request.status === "rejected"
                              ? "bg-red-600 text-white"
                              : "bg-yellow-600 text-white"
                        }
                      >
                        {request.status}
                      </Badge>
                      {request.approvedBy && (
                        <div className="text-xs text-muted-foreground mt-1">By: {request.approvedBy}</div>
                      )}
                    </TableCell>
                    <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell className="flex gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 hover:bg-green-100 bg-transparent"
                            onClick={() => handleStatusUpdate(request.id, request.user.email, "approved")}
                            disabled={updatingId === request.id}
                          >
                            <CheckIcon className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:bg-red-100 bg-transparent"
                            onClick={() => handleStatusUpdate(request.id, request.user.email, "rejected")}
                            disabled={updatingId === request.id}
                          >
                            <XIcon className="h-4 w-4" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </>
                      )}
                      {request.status !== "pending" && <span className="text-muted-foreground text-sm">Actioned</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
