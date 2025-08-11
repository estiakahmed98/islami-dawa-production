"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getAllEditRequests,
  updateEditRequestStatus,
  type EditRequest,
} from "@/lib/edit-requests";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Search,
  X,
} from "lucide-react";

interface EditRequestSummary {
  name: string;
  email: string;
  phone: string;
  role: string;
  location: {
    division: string;
    district: string;
    upazila: string;
    union: string;
  };
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  requests: EditRequest[];
}

export default function EditRequestsPage() {
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<EditRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>(
    {}
  );
  const tableRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEditRequests();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRequests(editRequests);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = editRequests.filter(
        (request) =>
          (request.email &&
            request.email.toLowerCase().includes(lowercasedSearch)) ||
          (request.name &&
            request.name.toLowerCase().includes(lowercasedSearch)) ||
          (request.phone && request.phone.includes(lowercasedSearch))
      );
      setFilteredRequests(filtered);
    }
  }, [searchTerm, editRequests]);

  const fetchEditRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEditRequests();
      setEditRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error("Error fetching edit requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupRequestsByUser = (
    requests: EditRequest[]
  ): EditRequestSummary[] => {
    const grouped: Record<string, EditRequestSummary> = {};

    for (const request of requests) {
      const email = request.email;

      if (!grouped[email]) {
        grouped[email] = {
          name: request.name || "N/A",
          email,
          phone: request.phone || "N/A",
          role: request.role || "N/A",
          location: request.location,
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0,
          requests: [],
        };
      }

      grouped[email].requests.push(request);

      if (request.status === "pending") grouped[email].pending += 1;
      else if (request.status === "approved") grouped[email].approved += 1;
      else if (request.status === "rejected") grouped[email].rejected += 1;

      grouped[email].total += 1;
    }

    return Object.values(grouped);
  };

  const toggleUser = (email: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const updateStatus = async (
    id: string,
    status: "pending" | "approved" | "rejected"
  ) => {
    try {
      await updateEditRequestStatus(id, status);
      fetchEditRequests();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const userSummaries = groupRequestsByUser(filteredRequests);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Edit Request Management</h2>

      {/* Search and Download Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className="overflow-x-auto bg-white shadow-lg rounded-lg p-2"
        ref={tableRef}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-bold text-black">Name</TableHead>
                <TableHead className="font-bold text-black">Email</TableHead>
                <TableHead className="font-bold text-black">Phone</TableHead>
                <TableHead className="font-bold text-black">Role</TableHead>
                <TableHead className="font-bold text-black">Pending</TableHead>
                <TableHead className="font-bold text-black">Approved</TableHead>
                <TableHead className="font-bold text-black">Rejected</TableHead>
                <TableHead className="font-bold text-black">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSummaries.length > 0 ? (
                userSummaries.map((user, idx) => (
                  <React.Fragment key={`user-summary-${user.email}`}>
                    <TableRow
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleUser(user.email)}
                    >
                      <TableCell className="font-medium flex items-center">
                        {expandedUsers[user.email] ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.pending}</TableCell>
                      <TableCell>{user.approved}</TableCell>
                      <TableCell>{user.rejected}</TableCell>
                      <TableCell className="font-bold">{user.total}</TableCell>
                    </TableRow>

                    {expandedUsers[user.email] && (
                      <TableRow>
                        <TableCell colSpan={8} className="p-0">
                          <div className="bg-gray-50 px-4 py-2 border-t border-b">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                              Edit Request Details
                            </h3>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-200">
                                    <TableHead className="text-xs">
                                      Date
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Location
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Reason
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Status
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {user.requests.map((request, i) => (
                                    <TableRow
                                      key={`${request.email}-${request.date}-${i}`}
                                      className={
                                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                      }
                                    >
                                      <TableCell className="text-xs">
                                        {request.date}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        {request.location.division},{" "}
                                        {request.location.district},{" "}
                                        {request.location.upazila}
                                        {request.location.union
                                          ? `, ${request.location.union}`
                                          : ""}
                                      </TableCell>
                                      <TableCell className="text-xs max-w-xs truncate">
                                        {request.reason}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        <div
                                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                            request.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : request.status === "approved"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {request.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            request.status.slice(1)}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        <div className="flex gap-1">
                                          <select
                                            value={request.status}
                                            onChange={(e) =>
                                              updateStatus(
                                                request.id || "",
                                                e.target.value as
                                                  | "pending"
                                                  | "approved"
                                                  | "rejected"
                                              )
                                            }
                                            className="text-xs border rounded p-1"
                                          >
                                            <option value="pending">
                                              Pending
                                            </option>
                                            <option value="approved">
                                              Approved
                                            </option>
                                            <option value="rejected">
                                              Rejected
                                            </option>
                                          </select>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No edit requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
