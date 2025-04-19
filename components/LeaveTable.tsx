"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
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
import { Download, FileText } from "lucide-react";
import html2pdf from "html2pdf.js";

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

  const handleDownloadPDF = () => {
    if (pdfRef.current) {
      const element = pdfRef.current;
      const opt = {
        margin: 10,
        filename: `leave_records_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };

      const clone = element.cloneNode(true) as HTMLElement;
      const title = document.createElement("h1");
      title.textContent = "Leave Records";
      title.style.textAlign = "center";
      title.style.marginBottom = "20px";

      const container = document.createElement("div");
      container.style.padding = "20px";
      container.appendChild(title);

      const userInfo = document.createElement("div");
      userInfo.innerHTML = `
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      `;
      userInfo.style.marginBottom = "20px";
      container.appendChild(userInfo);

      container.appendChild(clone);
      html2pdf().from(container).set(opt).save();
    }
  };

  const handleDownloadSingleLeave = (leave: LeaveRecord) => {
    const container = document.createElement("div");
    container.style.padding = "20px";

    const title = document.createElement("h1");
    title.textContent = "Leave Approval Certificate";
    title.style.textAlign = "center";
    title.style.marginBottom = "30px";
    container.appendChild(title);

    const userInfo = document.createElement("div");
    userInfo.innerHTML = `
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <p style="margin-bottom: 10px;"><strong>Name:</strong> ${userName}</p>
          <p style="margin-bottom: 10px;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin-bottom: 10px;"><strong>Phone:</strong> ${leave.phone || "N/A"}</p>
          <p style="margin-bottom: 10px;"><strong>Leave Type:</strong> ${leave.leaveType}</p>
          <p style="margin-bottom: 10px;"><strong>From:</strong> ${leave.from}</p>
          <p style="margin-bottom: 10px;"><strong>To:</strong> ${leave.to}</p>
          <p style="margin-bottom: 10px;"><strong>Total Days:</strong> ${leave.days}</p>
          <p style="margin-bottom: 10px;"><strong>Reason:</strong> ${leave.reason}</p>
          <p style="margin-bottom: 20px;"><strong >Status:</strong> ${leave.status}</p>
          <p style="margin-bottom: 10px;"><strong>Approved By:</strong> ${leave.approvedBy}</p>
          <p style="margin-bottom: 10px;"><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      `;
    userInfo.style.textAlign = "center";
    userInfo.style.display = "flex";
    userInfo.style.marginBottom = "30px";
    container.appendChild(userInfo);

    const signatureSection = document.createElement("div");
    signatureSection.style.marginTop = "50px";
    signatureSection.style.display = "flex";
    signatureSection.style.justifyContent = "space-between";

    const employeeSignature = document.createElement("div");
    employeeSignature.innerHTML = `
      <div style="border-top: 1px solid #000; padding-top: 10px; width: 200px; text-align: center;">
        <p>Employee Signature</p>
      </div>
    `;

    const approverSignature = document.createElement("div");
    approverSignature.innerHTML = `
      <div style="border-top: 1px solid #000; padding-top: 10px; width: 200px; text-align: center;">
        <p>Approver Signature</p>
      </div>
    `;

    signatureSection.appendChild(employeeSignature);
    signatureSection.appendChild(approverSignature);
    container.appendChild(signatureSection);

    const opt = {
      margin: 10,
      filename: `leave_approval_${leave.leaveType}_${leave.from}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    html2pdf().from(container).set(opt).save();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">ছুটি বিষয়</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)}>+ ছুটির আবেদন করুন</Button>
          <Button
            onClick={handleDownloadPDF}
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
