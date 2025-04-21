"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import LeaveSummary from "./LeaveSummary";
import LeaveForm from "./LeaveForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
// import html2pdf from "html2pdf.js";

interface LeaveRecord {
  id?: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  approvedBy: string;
  status: string;
  phone?: string;
  name?: string;
}

const LeaveTable: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "";

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

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
    setSelectedLeave(leave);
    setShowForm(true);
  };

  const handleDownloadAll = async () => {
    if (pdfRef.current) {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = pdfRef.current.cloneNode(true) as HTMLElement;

      // Create a container with professional styling
      const container = document.createElement("div");
      container.style.padding = "30px";
      container.style.fontFamily = "Arial, sans-serif";

      // Add header with title and user info
      const header = document.createElement("div");
      header.style.marginBottom = "20px";
      header.style.borderBottom = "2px solid #333";
      header.style.paddingBottom = "15px";

      const title = document.createElement("h1");
      title.textContent = "Leave Records";
      title.style.textAlign = "center";
      title.style.marginBottom = "10px";
      title.style.color = "#2d3748";

      const userInfo = document.createElement("div");
      userInfo.innerHTML = `
        <p style="text-align: center; margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
        <p style="text-align: center; margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
        <p style="text-align: center; margin: 5px 0;"><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
      `;

      header.appendChild(title);
      header.appendChild(userInfo);
      container.appendChild(header);

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
          header.style.border = "1px solid #e2e8f0";
        });

        // Style table cells
        const cells = table.querySelectorAll("td");
        cells.forEach((cell) => {
          cell.style.padding = "8px";
          cell.style.border = "1px solid #e2e8f0";
        });

        // Style status cells
        const statusCells = table.querySelectorAll("td:nth-child(7)");
        statusCells.forEach((cell) => {
          const status = cell.textContent?.trim();
          cell.innerHTML = ""; // Clear existing content

          const badge = document.createElement("span");
          badge.textContent = status || "";
          badge.style.padding = "4px 8px";
          badge.style.borderRadius = "4px";
          badge.style.fontWeight = "600";

          if (status === "Pending") {
            badge.style.backgroundColor = "#fed7d7";
            badge.style.color = "#9b2c2c";
          } else if (status === "Approved") {
            badge.style.backgroundColor = "#10b981";
            badge.style.color = "white";
          } else if (status === "Rejected") {
            badge.style.backgroundColor = "#7f1d1d";
            badge.style.color = "white";
          }

          cell.appendChild(badge);
          cell.style.textAlign = "center";
        });

        // Remove actions column
        const actionColumns = table.querySelectorAll(
          "th:last-child, td:last-child"
        );
        actionColumns.forEach((col) => col.remove());
      }

      container.appendChild(table);

      // Add footer
      const footer = document.createElement("div");
      footer.style.marginTop = "20px";
      footer.style.paddingTop = "10px";
      footer.style.borderTop = "1px solid #e2e8f0";
      footer.style.textAlign = "center";
      footer.style.fontSize = "10px";
      footer.style.color = "#6b7280";
      footer.textContent = "Confidential - For Internal Use Only";
      container.appendChild(footer);

      // PDF options
      const opt = {
        margin: 10,
        filename: `leave_records_${userName}_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };

      // Generate PDF
      html2pdf().from(container).set(opt).save();
    }
  };

  const handleDownloadSingleLeave = async (leave: LeaveRecord) => {
    const html2pdf = (await import("html2pdf.js")).default;
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
      } catch {
        return dateString;
      }
    };

    // Status badge styling
    let statusStyle = "";
    if (leave.status === "Pending") {
      statusStyle = "background-color: #fed7d7; color: #9b2c2c;";
    } else if (leave.status === "Approved") {
      statusStyle = "background-color: #10b981; color: white;";
    } else if (leave.status === "Rejected") {
      statusStyle = "background-color: #7f1d1d; color: white;";
    }

    container.innerHTML = `
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #2d3748; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">ছুটির আবেদন</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <!-- Employee Info -->
        <div style="padding: 25px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px;">দায়ীর তথ্য</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0;"><strong>নাম:</strong> ${leave.name || "N/A"}</p>
              <p style="margin: 5px 0;"><strong>ইমেইল:</strong> ${userEmail}</p>
            </div>
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0;"><strong>মোবাইল:</strong> ${leave.phone || "N/A"}</p>
              <p style="margin: 5px 0;"><strong>স্ট্যাটাস:</strong> 
                <span style="${statusStyle} padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                  ${leave.status}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <!-- Leave Details -->
        <div style="padding: 25px;">
          <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px;">ছুটির বিবরন </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0;"><strong>ছুটির ধরন:</strong> ${leave.leaveType}</p>
              <p style="margin: 5px 0;"><strong>শুরুর তারিখ:</strong> ${formatDate(leave.from)}</p>
              <p style="margin: 5px 0;"><strong>শেষ তারিখ:</strong> ${formatDate(leave.to)}</p>
            </div>
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0;"><strong>মোট দিন:</strong> ${leave.days}</p>
              <p style="margin: 5px 0;"><strong>অনুমুদন করেছে:</strong> ${leave.approvedBy}</p>
            </div>
          </div>
          
          <div style="margin-top: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">ছুটির কারন:</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px;">
              ${leave.reason}
            </div>
          </div>
        </div>
        
        <!-- Signatures -->
        <div style="padding: 25px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
        <div style="margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">বিশেষ দ্রষ্টব্য :</h3>
            <p style="font-size: 14px; color: #4a5568; margin: 0;"> ছুটির আবেদনের একটি আনুষ্ঠানিক রেকর্ড এবং এর বর্তমান অবস্থার প্রতিনিধিত্ব করে। অনুগ্রহ করে এটি আপনার রেকর্ডের জন্য সংরক্ষণ করুন।</p>
          </div>  
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div style="text-align: center; width: 45%;">
              <div style="border-top: 1px solid #718096; width: 80%; margin: 0 auto;"></div>
              <p style="margin: 5px 0 0 0;">দায়ী স্বাক্ষর</p>
            </div>
            <div style="text-align: center; width: 45%;">
              <div style="border-top: 1px solid #718096; width: 80%; margin: 0 auto;"></div>
              <p style="margin: 5px 0 0 0;">এডমিন স্বাক্ষর</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #2d3748; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ. © ${new Date().getFullYear()}</p>
        </div>
      </div>
    `;

    // PDF options
    const opt = {
      margin: 10,
      filename: `leave_approval_${leave.leaveType}_${leave.from.split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Generate PDF
    html2pdf().from(container).set(opt).save();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-center">
        {leaves.length > 0 && <LeaveSummary leaves={leaves} />}
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">ছুটি বিষয়</h2>
        <div className="flex gap-2">
          <Button
            className="bg-[#155E75] hover:bg-[#1d809e]"
            onClick={() => setShowForm(true)}
          >
            + ছুটির আবেদন করুন
          </Button>
          <Button
            onClick={handleDownloadAll}
            variant="outline"
            className="flex items-center gap-2 bg-green-800 text-white hover:bg-green-700 hover:text-white"
          >
            <Download className=" h-4 w-4" />
            Download All
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="z-30 max-w-[95vh] max-h-[70vh] overflow-y-auto">
            <LeaveForm
              onClose={() => {
                setShowForm(false);
                setSelectedLeave(null);
              }}
              onRefresh={fetchLeaves}
              existingData={selectedLeave}
              userEmail={userEmail}
              userName={userName}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto" ref={pdfRef}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Phone</TableHead>
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
                  <TableCell>{leave.phone || "N/A"}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-md text-sm flex items-center justify-center font-semibold ${
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
                    <div className="flex items-center gap-2">
                      {leave.status === "Pending" ? (
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(leave)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => handleDownloadSingleLeave(leave)}
                        >
                          Download PDF
                        </Button>
                      )}
                    </div>
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
