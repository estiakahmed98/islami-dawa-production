"use client";

import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LeaveRecord {
  id: string;
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
  phone?: string;
  name?: string;
}

const AdminNotifications: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRecord[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleDownloadAll = () => {
    if (tableRef.current) {
      // Create a clone of the table for PDF generation
      const element = tableRef.current.cloneNode(true) as HTMLElement;

      // Create a container with professional styling
      const container = document.createElement("div");
      container.style.padding = "30px";
      container.style.fontFamily = "Arial, sans-serif";

      // Add a professional header with company logo placeholder
      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.marginBottom = "30px";
      header.style.borderBottom = "2px solid #333";
      header.style.paddingBottom = "15px";

      // Add report title
      const title = document.createElement("h1");
      title.textContent = "Leave Requests Report";
      title.style.color = "#2d3748";
      title.style.margin = "0";
      title.style.fontSize = "28px";
      title.style.fontWeight = "bold";

      header.appendChild(title);
      container.appendChild(header);

      // Add metadata section with current date and request count
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

      meta.innerHTML = `
        <div style="display:flex;justify-content:space-between">
          <p style="margin:5px 0;font-size:14px;"><strong>Generated on:</strong> ${currentDate}</p>
          <p style="margin:5px 0;font-size:14px;"><strong>Total Requests:</strong> ${filteredLeaves.length}</p>
        </div>
      `;
      container.appendChild(meta);

      // Style the table for PDF
      const table = element.querySelector("table");
      if (table) {
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.fontSize = "12px";

        // Style table headers
        const headers = table.querySelectorAll("th");
        headers.forEach((header) => {
          header.style.backgroundColor = "#2d3748";
          header.style.color = "white";
          header.style.padding = "10px";
          header.style.textAlign = "left";
          header.style.fontWeight = "bold";
          header.style.border = "1px solid #e2e8f0";
        });

        // Style table rows for zebra striping
        const rows = table.querySelectorAll("tr:not(:first-child)");
        rows.forEach((row, index) => {
          row.style.backgroundColor = index % 2 === 0 ? "#f8fafc" : "white";
        });

        // Style table cells
        const cells = table.querySelectorAll("td");
        cells.forEach((cell) => {
          cell.style.padding = "8px 10px";
          cell.style.border = "1px solid #e2e8f0";
        });

        // Fix status cells with proper colors and styling
        const statusCells = table.querySelectorAll("td:nth-child(9)");
        statusCells.forEach((cell) => {
          const status = cell.textContent.trim();
          cell.innerHTML = ""; // Clear the cell content

          // Create a styled status badge
          const statusBadge = document.createElement("div");
          statusBadge.textContent = status;
          statusBadge.style.padding = "4px 8px";
          statusBadge.style.borderRadius = "4px";
          statusBadge.style.fontWeight = "600";
          statusBadge.style.fontSize = "11px";
          statusBadge.style.display = "inline-block";
          statusBadge.style.textAlign = "center";

          // Set the appropriate background and text color
          if (status === "Pending") {
            statusBadge.style.backgroundColor = "#fed7d7";
            statusBadge.style.color = "#9b2c2c";
          } else if (status === "Approved") {
            statusBadge.style.backgroundColor = "#10b981";
            statusBadge.style.color = "white";
          } else if (status === "Rejected") {
            statusBadge.style.backgroundColor = "#7f1d1d";
            statusBadge.style.color = "white";
          }

          cell.appendChild(statusBadge);
          cell.style.textAlign = "center";
        });

        // Remove the Actions column and any buttons/interactive elements
        const actionCells = table.querySelectorAll(
          "th:last-child, td:last-child"
        );
        actionCells.forEach((cell) => cell.remove());
      }

      container.appendChild(table);

      // Add footer with page number
      const footer = document.createElement("div");
      footer.style.marginTop = "20px";
      footer.style.borderTop = "1px solid #e2e8f0";
      footer.style.paddingTop = "10px";
      footer.style.fontSize = "10px";
      footer.style.color = "#6b7280";
      footer.style.textAlign = "center";
      footer.innerHTML = `<p>Confidential - For Internal Use Only | Page 1</p>`;
      container.appendChild(footer);

      // PDF generation options
      const opt = {
        margin: [15, 15],
        filename: `leave_requests_report_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        pagebreak: { mode: "avoid-all" },
      };

      // Generate PDF
      html2pdf().from(container).set(opt).save();
    }
  };

  const handleDownloadSingle = (leave: LeaveRecord) => {
    // Create main container
    const container = document.createElement("div");
    container.style.padding = "40px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.maxWidth = "800px";
    container.style.margin = "0 auto";

    // Format dates for better readability
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (e) {
        return dateString; // Return original if parsing fails
      }
    };

    const fromDate = formatDate(leave.from);
    const toDate = formatDate(leave.to);

    // Create status badge styling based on status
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

    // Create the document content with improved styling
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
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">Name:</strong> ${leave.name || "N/A"}</p>
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">Email:</strong> ${leave.email}</p>
            </div>
            <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">Phone:</strong> ${leave.phone || "N/A"}</p>
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">Status:</strong> <span style="${statusStyle}">${leave.status}</span></p>
            </div>
          </div>
        </div>
        
        <!-- Leave Details -->
        <div style="padding: 25px;">
          <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px; border-bottom: 2px solid #cbd5e0; padding-bottom: 10px;">Leave Details</h2>
          <div style="display: flex; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">Leave Type:</strong> ${leave.leaveType}</p>
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">From:</strong> ${fromDate}</p>
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">To:</strong> ${toDate}</p>
            </div>
            <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">Days:</strong> ${leave.days}</p>
              <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">Approved By:</strong> ${leave.approvedBy || "Pending"}</p>
            </div>
          </div>
          
          <div style="margin-top: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">Reason for Leave:</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px; font-size: 15px;">
              ${leave.reason}
            </div>
          </div>
        </div>
        
        <!-- Note & Signature Section -->
        <div style="padding: 25px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">Note:</h3>
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

          <p style="margin: 5px 0 0 0;">ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ. © ${new Date().getFullYear()}</p>
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

    html2pdf().from(container).set(opt).save();
  };

  const clearSearch = () => {
    setSearchTerm("");
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
        >
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      <div
        className="overflow-x-auto bg-white shadow-lg rounded-lg p-2"
        ref={tableRef}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-black">Name</TableHead>
              <TableHead className="font-bold text-black">Email</TableHead>
              <TableHead className="font-bold text-black">Phone</TableHead>
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
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave, index) => (
                <TableRow key={index}>
                  <TableCell>{leave.name || "N/A"}</TableCell>
                  <TableCell>{leave.email}</TableCell>
                  <TableCell>{leave.phone || "N/A"}</TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>{leave.from}</TableCell>
                  <TableCell>{leave.to}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <div
                      className={`flex items-center justify-center rounded-md text-sm font-semibold ${
                        leave.status === "Pending"
                          ? "bg-red-200 text-red-700"
                          : leave.status === "Approved"
                            ? "bg-green-500 text-white"
                            : "bg-red-800 text-white"
                      }`}
                    >
                      <span>{leave.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
                        className="border rounded-md p-2"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSingle(leave)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500">
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
