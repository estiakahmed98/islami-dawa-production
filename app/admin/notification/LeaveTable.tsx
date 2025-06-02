"use client";

import React from "react";

import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Search,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";

const html2pdf = dynamic(
  () => import("html2pdf.js").then((module) => module.default),
  { ssr: false }
);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LeaveRecord {
  id: string;
  email: string;
  name?: string;
  phone?: string;
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

interface LeaveUserSummary {
  name: string;
  email: string;
  phone?: string;
  casual: number;
  sick: number;
  paternity: number;
  other: number;
  total: number;
  leaves: LeaveRecord[]; // full list of their leaves
}

const AdminLeaveManagement: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRecord[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>(
    {}
  );
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLeaves(leaveRequests);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = leaveRequests.filter(
        (leave) =>
          (leave.email &&
            leave.email.toLowerCase().includes(lowercasedSearch)) ||
          (leave.name && leave.name.toLowerCase().includes(lowercasedSearch)) ||
          (leave.phone && leave.phone.includes(lowercasedSearch))
      );
      setFilteredLeaves(filtered);
    }
  }, [searchTerm, leaveRequests]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notification");
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data.leaveRequests);
        setFilteredLeaves(data.leaveRequests);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const groupLeavesByUser = (leaves: LeaveRecord[]): LeaveUserSummary[] => {
    const grouped: Record<string, LeaveUserSummary> = {};

    for (const leave of leaves) {
      const email = leave.email;

      if (!grouped[email]) {
        grouped[email] = {
          name: leave.name || "N/A",
          email,
          phone: leave.phone || "N/A",
          casual: 0,
          sick: 0,
          paternity: 0,
          other: 0,
          total: 0,
          leaves: [],
        };
      }

      grouped[email].leaves.push(leave);

      // Only count approved leaves in the summary totals
      if (leave.status === "Approved") {
        const type = leave.leaveType;
        const days = Number(leave.days);

        if (type === "Casual") grouped[email].casual += days;
        else if (type === "Sick") grouped[email].sick += days;
        else if (type === "Paternity") grouped[email].paternity += days;
        else grouped[email].other += days;

        grouped[email].total += days;
      }
    }

    return Object.values(grouped);
  };

  const toggleUser = (email: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const handleDownloadAll = async () => {
    if (tableRef.current) {
      try {
        // Dynamically import html2pdf when needed
        const html2pdf = (await import("html2pdf.js")).default;

        // Create a clone of the table for PDF generation
        const element = tableRef.current.cloneNode(true) as HTMLElement;

        // Create a container with professional styling
        const container = document.createElement("div");
        container.style.padding = "30px";
        container.style.fontFamily = "Arial, sans-serif";

        // Add a professional header
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.marginBottom = "30px";
        header.style.borderBottom = "2px solid #333";
        header.style.paddingBottom = "15px";

        const title = document.createElement("h1");
        title.textContent = "ছুটি সম্পর্কিত তথ্য";
        title.style.color = "#2d3748";
        title.style.margin = "0";
        title.style.fontSize = "28px";
        title.style.fontWeight = "bold";

        header.appendChild(title);
        container.appendChild(header);

        // Add metadata section
        const meta = document.createElement("div");
        meta.style.marginBottom = "25px";
        meta.style.padding = "15px";
        meta.style.backgroundColor = "#f9fafb";
        meta.style.borderRadius = "6px";
        meta.style.border = "1px solid #e5e7eb";

        const currentDate = new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const userSummaries = groupLeavesByUser(filteredLeaves);

        meta.innerHTML = `
          <div style="display:flex;justify-content:space-between">
            <p style="margin:5px 0;font-size:14px;"><strong>ডাউনলোডের তারিখ ও সময়:</strong> ${currentDate}</p>
            <p style="margin:5px 0;font-size:14px;"><strong>মোট দাঁয়ী:</strong> ${userSummaries.length}</p>
          </div>
        `;
        container.appendChild(meta);

        // Create summary table
        const summaryTable = document.createElement("table");
        summaryTable.style.width = "100%";
        summaryTable.style.borderCollapse = "collapse";
        summaryTable.style.fontSize = "12px";
        summaryTable.style.marginBottom = "20px";

        // Table header
        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Name</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Email</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Phone</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Casual</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Sick</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Paternity</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Other</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Total</th>
          </tr>
        `;
        summaryTable.appendChild(thead);

        // Table body
        const tbody = document.createElement("tbody");
        userSummaries.forEach((user, index) => {
          const row = document.createElement("tr");
          row.style.backgroundColor = index % 2 === 0 ? "#f8fafc" : "white";

          row.innerHTML = `
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.name}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.email}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.phone}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.casual}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.sick}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.paternity}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.other}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: bold;">${user.total}</td>
          `;
          tbody.appendChild(row);
        });
        summaryTable.appendChild(tbody);
        container.appendChild(summaryTable);

        // Add footer
        const footer = document.createElement("div");
        footer.style.marginTop = "20px";
        footer.style.borderTop = "1px solid #e2e8f0";
        footer.style.paddingTop = "10px";
        footer.style.fontSize = "10px";
        footer.style.color = "#6b7280";
        footer.style.textAlign = "center";
        footer.innerHTML = `<p>Confidential - For Internal Use Only | Page 1</p>`;
        container.appendChild(footer);

        // PDF options
        const opt = {
          margin: [15, 15],
          filename: `leave_summary_report_${new Date().toISOString().split("T")[0]}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          pagebreak: { mode: "avoid-all" },
        };

        // Generate PDF
        await html2pdf().set(opt).from(container).save();
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
      }
    }
  };

  const handleDownloadSingle = async (leave: LeaveRecord) => {
    try {
      // Dynamically import html2pdf when needed
      const html2pdf = (await import("html2pdf.js")).default;

      // Create main container
      const container = document.createElement("div");
      container.style.padding = "40px";
      container.style.fontFamily = "Arial, sans-serif";
      container.style.maxWidth = "800px";
      container.style.margin = "0 auto";

      // Format dates
      const formatDate = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch (e) {
          return dateString;
        }
      };

      const fromDate = formatDate(leave.from);
      const toDate = formatDate(leave.to);

      // Status styling
      let statusStyle = "";
      let statusBgColor = "";
      let statusTextColor = "";

      if (leave.status === "Pending") {
        statusBgColor = "#fed7d7";
        statusTextColor = "#9b2c2c";
      } else if (leave.status === "Approved") {
        statusBgColor = "#10b981";
        statusTextColor = "white";
      } else if (leave.status === "Rejected") {
        statusBgColor = "#7f1d1d";
        statusTextColor = "white";
      }

      statusStyle = `
        display: inline-block;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: bold;
        background-color: ${statusBgColor};
        color: ${statusTextColor};
      `;

      // Create content
      const content = `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #2d3748; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="margin: 0; font-size: 24px;">ছুটির আবেদন</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Generated on ${new Date().toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}</p>
            </div>
          </div>
          
          <!-- Employee Information -->
          <div style="padding: 25px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px; border-bottom: 2px solid #cbd5e0; padding-bottom: 10px;">দায়ী তথ্য</h2>
            <div style="display: flex; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">নাম:</strong> ${leave.name || "N/A"}</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">ইমেইল:</strong> ${leave.email}</p>
              </div>
              <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">মোবাইল:</strong> ${leave.phone || "N/A"}</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">স্ট্যাটাস:</strong> <span style="${statusStyle}">${leave.status}</span></p>
              </div>
            </div>
          </div>
          
          <!-- Leave Details -->
          <div style="padding: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px; border-bottom: 2px solid #cbd5e0; padding-bottom: 10px;">ছুটির বিবরন</h2>
            <div style="display: flex; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">ছুটির ধরন:</strong> ${leave.leaveType}</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">শুরুর তারিখ:</strong> ${fromDate}</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">শেষ তারিখ:</strong> ${toDate}</p>
              </div>
              <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">মোট দিন:</strong> ${leave.days}</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">অনুমুদন করেছে:</strong> ${leave.approvedBy || "Pending"}</p>
              </div>
            </div>
            
            <div style="margin-top: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">ছুটির বিবরন:</h3>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px; font-size: 15px;">
                ${leave.reason}
              </div>
            </div>
          </div>
          
          <!-- Note & Signature Section -->
          <div style="padding: 25px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <div style="margin-bottom: 30px;">
              <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">বিশেষ দ্রষ্টব্য:</h3>
              <p style="font-size: 14px; color: #4a5568; margin: 0;"> ছুটির আবেদনের একটি আনুষ্ঠানিক রেকর্ড এবং এর বর্তমান অবস্থার প্রতিনিধিত্ব করে। অনুগ্রহ করে এটি আপনার রেকর্ডের জন্য সংরক্ষণ করুন।</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 40px;">
              <div style="text-align: center; flex: 1;">
                <div style="border-top: 1px solid #718096; width: 80%; margin: 0 auto;"></div>
                <p style="font-size: 14px; margin: 5px 0 0 0;">দায়ী স্বাক্ষর</p>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="border-top: 1px solid #718096; width: 80%; margin: 0 auto;"></div>
                <p style="font-size: 14px; margin: 5px 0 0 0;">এডমিন স্বাক্ষর</p>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #2d3748; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 5px 0 0 0;">ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ. © ${new Date().getFullYear()}</p>
          </div>
        </div>
      `;

      container.innerHTML = content;

      // PDF options
      const opt = {
        margin: 10,
        filename: `leave_request_${leave.name || "user"}_${leave.from.split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Generate PDF
      await html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  const clearSearch = () => {
    setSearchTerm("");
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
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const userSummaries = groupLeavesByUser(filteredLeaves);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">ছুটির ব্যবস্থাপনা</h2>

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
        <Button
          onClick={handleDownloadAll}
          variant="outline"
          className="bg-green-800 flex items-center justify-center text-white hover:bg-green-700 hover:text-white"
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isGeneratingPdf ? "Generating..." : "Download Summary"}
        </Button>
      </div>

      <div
        className="overflow-x-auto bg-white shadow-lg rounded-lg p-2"
        ref={tableRef}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="font-bold text-black">Name</TableHead>
              <TableHead className="font-bold text-black">Email</TableHead>
              <TableHead className="font-bold text-black">Phone</TableHead>
              <TableHead className="font-bold text-black">
                Casual Leave
              </TableHead>
              <TableHead className="font-bold text-black">Sick Leave</TableHead>
              <TableHead className="font-bold text-black">
                Paternity Leave
              </TableHead>
              <TableHead className="font-bold text-black">
                Other Leave
              </TableHead>
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
                    <TableCell>{user.casual}</TableCell>
                    <TableCell>{user.sick}</TableCell>
                    <TableCell>{user.paternity}</TableCell>
                    <TableCell>{user.other}</TableCell>
                    <TableCell className="font-bold">{user.total}</TableCell>
                  </TableRow>

                  {expandedUsers[user.email] && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <div className="bg-gray-50 px-4 py-2 border-t border-b">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Leave Details
                          </h3>
                          <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-200">
                                  <TableHead className="text-xs">
                                    Type
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    From
                                  </TableHead>
                                  <TableHead className="text-xs">To</TableHead>
                                  <TableHead className="text-xs">
                                    Days
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
                                {user.leaves.map((leave, i) => (
                                  <TableRow
                                    key={`${leave.email}-${leave.date}-${i}`}
                                    className={
                                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    }
                                  >
                                    <TableCell className="text-xs">
                                      {leave.leaveType}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {leave.from}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {leave.to}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {leave.days}
                                    </TableCell>
                                    <TableCell className="text-xs max-w-xs truncate">
                                      {leave.reason}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      <div
                                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                          leave.status === "Pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : leave.status === "Approved"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {leave.status}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      <div className="flex gap-1">
                                        <select
                                          value={leave.status}
                                          onChange={(e) =>
                                            updateStatus(
                                              leave.email,
                                              leave.date,
                                              leave.index,
                                              e.target.value,
                                              leave.leaveType,
                                              leave.name || "",
                                              leave.from,
                                              leave.to,
                                              leave.reason
                                            )
                                          }
                                          className="text-xs border rounded p-1"
                                        >
                                          <option value="Pending">
                                            Pending
                                          </option>
                                          <option value="Approved">
                                            Approved
                                          </option>
                                          <option value="Rejected">
                                            Rejected
                                          </option>
                                        </select>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            handleDownloadSingle(leave)
                                          }
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
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

export default AdminLeaveManagement;
