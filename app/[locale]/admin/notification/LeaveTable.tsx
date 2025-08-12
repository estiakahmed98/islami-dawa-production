"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronRight, Download, Loader2, Search, Eye, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

interface LeaveRecord {
  id: string;
  userId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  approvedBy: string | null;
  status: string;
  requestDate: string;
  rejectionReason?: string | null;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
}

interface LeaveUserSummary {
  name: string;
  email: string;
  phone?: string;
  casual: number;
  sick: number;
  maternity: number;
  paternity: number;
  annual: number;
  other: number;
  total: number;
  leaves: LeaveRecord[];
  notificationCount: number;
  hasNewNotification: boolean;
}

const isRecent = (dateString: string, hours = 48) => {
  const dt = new Date(dateString);
  if (Number.isNaN(dt.getTime())) return false;
  const diffH = (Date.now() - dt.getTime()) / (1000 * 60 * 60);
  return diffH <= hours;
};

const lower = (s?: string) => (s ?? "").toLowerCase();

// safe filename pieces
const safeFilename = (s: string) =>
  (s ?? "user")
    .toString()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60) || "user";

const ymd = (d: string) => {
  const dt = new Date(d);
  if (!Number.isNaN(dt.getTime())) {
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return (String(d).replace(/[^\d-]/g, "_").slice(0, 10) || "date");
};

// SSR-safe YYYY-MM-DD (UTC)
const formatDateYMD = (dateString: string) => {
  const dt = new Date(dateString);
  if (Number.isNaN(dt.getTime())) return dateString;
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const AdminLeaveManagement: React.FC = () => {
  const t = useTranslations("leaveAdmin");

  const [leaveRequests, setLeaveRequests] = useState<LeaveRecord[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [viewReasonModal, setViewReasonModal] = useState<{ open: boolean; text: string; }>({ open: false, text: "" });
  const tableRef = useRef<HTMLDivElement>(null);

  const [rejectModal, setRejectModal] = useState<{ open: boolean; leave: LeaveRecord | null; reason: string; }>({
    open: false, leave: null, reason: ""
  });

  const html2pdfRef = useRef<any | null>(null);
  const ensureHtml2Pdf = useCallback(async () => {
    if (html2pdfRef.current) return html2pdfRef.current;
    const mod = await import("html2pdf.js/dist/html2pdf.bundle.min.js");
    html2pdfRef.current = (mod as any).default || mod;
    return html2pdfRef.current;
  }, []);

  const fetchLeaveRequestsForAdmin = useCallback(async () => {
    try {
      const response = await fetch("/api/leaves");
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data.leaveRequests);
        setFilteredLeaves(data.leaveRequests);
      } else {
        const errorData = await response.json();
        toast.error(t("toasts.fetchFailed", { msg: errorData.error || "Unknown error" }));
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error(t("toasts.fetchUnexpected"));
    }
  }, [t]);

  useEffect(() => {
    fetchLeaveRequestsForAdmin();
  }, [fetchLeaveRequestsForAdmin]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLeaves(leaveRequests);
    } else {
      const needle = searchTerm.toLowerCase();
      const filtered = leaveRequests.filter((leave) => {
        const hay = [
          leave.user.email,
          leave.user.name ?? "",
          leave.user.phone ?? "",
          leave.leaveType ?? "",
          leave.reason ?? "",
          leave.status ?? "",
          leave.rejectionReason ?? ""
        ].join(" ").toLowerCase();
        return hay.includes(needle);
      });
      setFilteredLeaves(filtered);
    }
  }, [searchTerm, leaveRequests]);

  const groupLeavesByUser = (leaves: LeaveRecord[]): LeaveUserSummary[] => {
    const grouped: Record<string, LeaveUserSummary> = {};

    for (const leave of leaves) {
      const email = leave.user.email;
      if (!grouped[email]) {
        grouped[email] = {
          name: leave.user.name || t("labels.na"),
          email,
          phone: leave.user.phone || t("labels.na"),
          casual: 0, sick: 0, maternity: 0, paternity: 0, annual: 0, other: 0, total: 0,
          leaves: [], notificationCount: 0, hasNewNotification: false,
        };
      }

      const bucket = grouped[email];
      bucket.leaves.push(leave);

      if (lower(leave.status) === "pending") {
        bucket.notificationCount += 1;
        if (isRecent(leave.requestDate, 48)) bucket.hasNewNotification = true;
      }

      if (lower(leave.status) === "approved") {
        const type = lower(leave.leaveType);
        const days = Number(leave.days) || 0;
        if (type === "casual") bucket.casual += days;
        else if (type === "sick") bucket.sick += days;
        else if (type === "maternity") bucket.maternity += days;
        else if (type === "paternity") bucket.paternity += days;
        else if (type === "annual") bucket.annual += days;
        else bucket.other += days;
        bucket.total += days;
      }
    }

    return Object.values(grouped);
  };

  const toggleUser = (email: string) => {
    setExpandedUsers((prev) => ({ ...prev, [email]: !prev[email] }));
  };

  const handleDownloadAll = async () => {
    setIsGeneratingPdf(true);
    try {
      const html2pdf = await ensureHtml2Pdf();

      const container = document.createElement("div");
      container.style.padding = "24px";
      container.style.fontFamily = "Arial, sans-serif";

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.marginBottom = "30px";
      header.style.borderBottom = "2px solid #333";
      header.style.paddingBottom = "12px";
      header.innerHTML = `
        <div>
          <h1 style="margin:0;font-size:22px;color:#2d3748">${t("pdf.summaryTitle")}</h1>
          <p style="margin:6px 0 0 0;font-size:12px;color:#475569">
            ${t("pdf.generatedOn")}: ${new Date().toLocaleString()}
          </p>
        </div>
        <div style="font-size:12px;color:#334155">
          ${t("pdf.totalPeople")}: <strong>${groupLeavesByUser(filteredLeaves).length}</strong>
        </div>
      `;
      container.appendChild(header);

      const summaryTable = document.createElement("table");
      summaryTable.style.width = "100%";
      summaryTable.style.borderCollapse = "collapse";
      summaryTable.style.fontSize = "12px";

      const heads = [
        t("columns.name"),
        t("columns.email"),
        t("columns.phone"),
        t("columns.casual"),
        t("columns.sick"),
        t("columns.maternity"),
        t("columns.paternity"),
        t("columns.annual"),
        t("columns.other"),
        t("columns.total"),
      ];

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          ${heads
            .map(
              (h) =>
                `<th style="background:#2d3748;color:#fff;padding:10px;text-align:left;border:1px solid #e2e8f0">${h}</th>`
            )
            .join("")}
        </tr>
      `;
      summaryTable.appendChild(thead);

      const tbody = document.createElement("tbody");
      const userSummaries = groupLeavesByUser(filteredLeaves);
      userSummaries.forEach((user, index) => {
        const row = document.createElement("tr");
        row.style.background = index % 2 === 0 ? "#f8fafc" : "#ffffff";
        row.innerHTML = `
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.name}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.email}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.phone}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.casual}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.sick}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.maternity}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.paternity}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.annual}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${user.other}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;font-weight:700">${user.total}</td>
        `;
        tbody.appendChild(row);
      });
      summaryTable.appendChild(tbody);
      container.appendChild(summaryTable);

      await html2pdf()
        .set({
          margin: [15, 15],
          filename: `leave_summary_report_${new Date().toISOString().split("T")[0]}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(container)
        .save();

      toast.success(t("toasts.summarySuccess"));
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t("toasts.summaryFail"));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadSingle = async (leave: LeaveRecord) => {
    setIsGeneratingPdf(true);
    try {
      const html2pdf = await ensureHtml2Pdf();

      const fmtLong = (dateString: string) => {
        const dt = new Date(dateString);
        if (!Number.isNaN(dt.getTime())) {
          return dt.toLocaleDateString(undefined, {
            year: "numeric", month: "long", day: "numeric",
          });
        }
        return dateString;
      };

      const fromDate = fmtLong(leave.fromDate);
      const toDate = fmtLong(leave.toDate);

      let statusBgColor = "#fde68a"; // pending
      let statusTextColor = "#7c2d12";
      const st = lower(leave.status || "pending");
      if (st === "approved") { statusBgColor = "#10b981"; statusTextColor = "#ffffff"; }
      else if (st === "rejected") { statusBgColor = "#ef4444"; statusTextColor = "#ffffff"; }

      const tStatus = (s: string) =>
        s === "approved" ? t("status.approved")
        : s === "rejected" ? t("status.rejected")
        : t("status.pending");

      const typeLabel = (lt: string) => {
        const v = lower(lt);
        if (v === "casual") return t("types.casual");
        if (v === "sick") return t("types.sick");
        if (v === "maternity") return t("types.maternity");
        if (v === "paternity") return t("types.paternity");
        if (v === "annual") return t("types.annual");
        return t("types.other");
      };

      const container = document.createElement("div");
      container.style.padding = "40px";
      container.style.fontFamily = "Arial, sans-serif";
      container.style.maxWidth = "800px";
      container.style.margin = "0 auto";
      container.innerHTML = `
        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1)">
          <div style="background:#2d3748;color:#fff;padding:20px">
            <h1 style="margin:0;font-size:24px">${t("pdf.singleTitle")}</h1>
            <p style="margin:6px 0 0 0;font-size:12px;opacity:.85">
              ${t("pdf.generatedOn")}: ${new Date().toLocaleString()}
            </p>
          </div>

          <div style="padding:24px;background:#f8fafc;border-bottom:1px solid #e2e8f0">
            <h2 style="margin:0 0 12px 0;color:#334155;font-size:16px;border-bottom:2px solid #cbd5e0;padding-bottom:8px">${t("pdf.employeeInfo")}</h2>
            <div style="display:flex;gap:24px;flex-wrap:wrap">
              <div style="min-width:240px">
                <p style="margin:4px 0"><strong>${t("columns.name")}:</strong> ${leave.user.name || t("labels.na")}</p>
                <p style="margin:4px 0"><strong>${t("columns.email")}:</strong> ${leave.user.email}</p>
              </div>
              <div style="min-width:240px">
                <p style="margin:4px 0"><strong>${t("columns.phone")}:</strong> ${leave.user.phone || t("labels.na")}</p>
                <p style="margin:4px 0"><strong>${t("columns.status")}:</strong>
                  <span style="display:inline-block;padding:4px 10px;border-radius:6px;background:${statusBgColor};color:${statusTextColor};font-weight:700">
                    ${tStatus(st)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div style="padding:24px">
            <h2 style="margin:0 0 12px 0;color:#334155;font-size:16px;border-bottom:2px solid #cbd5e0;padding-bottom:8px">${t("pdf.leaveDetails")}</h2>
            <div style="display:flex;gap:24px;flex-wrap:wrap">
              <div style="min-width:240px">
                <p style="margin:4px 0"><strong>${t("columns.type")}:</strong> ${typeLabel(leave.leaveType)}</p>
                <p style="margin:4px 0"><strong>${t("columns.from")}:</strong> ${fromDate}</p>
                <p style="margin:4px 0"><strong>${t("columns.to")}:</strong> ${toDate}</p>
              </div>
              <div style="min-width:240px">
                <p style="margin:4px 0"><strong>${t("columns.days")}:</strong> ${leave.days}</p>
                <p style="margin:4px 0"><strong>${t("columns.approvedBy")}:</strong> ${leave.approvedBy || t("labels.pending")}</p>
              </div>
            </div>

            <div style="margin-top:14px">
              <h3 style="margin:0 0 8px 0;color:#334155;font-size:14px">${t("labels.reason")}</h3>
              <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:13px;line-height:1.6">
                ${leave.reason ?? ""}
              </div>
              ${
                st === "rejected" && leave.rejectionReason
                  ? `<div style="margin-top:10px"><strong>${t("labels.rejectionReason")}:</strong> ${leave.rejectionReason}</div>`
                  : ""
              }
            </div>
          </div>

          <div style="padding:20px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;gap:24px;justify-content:space-between">
            <div style="text-align:center;flex:1">
              <div style="border-top:1px solid #94a3b8;margin:0 32px"></div>
              <p style="margin:6px 0 0 0;font-size:12px;color:#334155">${t("pdf.employeeSign")}</p>
            </div>
            <div style="text-align:center;flex:1">
              <div style="border-top:1px solid #94a3b8;margin:0 32px"></div>
              <p style="margin:6px 0 0 0;font-size:12px;color:#334155">${t("pdf.adminSign")}</p>
            </div>
          </div>
        </div>
      `;

      await html2pdf()
        .set({
          margin: 10,
          filename: `leave_request_${safeFilename(leave.user.name || "user")}_${ymd(leave.fromDate)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .save();

      toast.success(t("toasts.singleSuccess"));
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t("toasts.singleFail"));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const clearSearch = () => setSearchTerm("");

  const updateStatus = async (
    leaveId: string,
    userEmail: string,
    newStatus: string,
    approvedBy = "Admin",
    rejectionReason?: string
  ) => {
    try {
      const payload: any = {
        id: leaveId,
        email: userEmail,
        status: newStatus,
        approvedBy: lower(newStatus) === "approved" ? approvedBy : null,
      };
      if (rejectionReason !== undefined) payload.rejectionReason = (rejectionReason ?? "").trim();

      const response = await fetch("/api/leaves", {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success(t("toasts.statusUpdated"));
        setRejectModal({ open: false, leave: null, reason: "" });
        fetchLeaveRequestsForAdmin();
      } else {
        const errorData = await response.json();
        toast.error(t("toasts.statusFailed", { msg: errorData.error || "Unknown error" }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("toasts.statusUnexpected"));
    }
  };

  const handleStatusChange = (leave: LeaveRecord, value: string) => {
    const newStatus = lower(value);
    if (newStatus === "rejected") {
      setRejectModal({ open: true, leave, reason: leave.rejectionReason || "" });
    } else {
      updateStatus(leave.id, leave.user.email, newStatus, "Admin");
    }
  };

  const userSummaries = groupLeavesByUser(filteredLeaves);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Card className="w-full mx-auto shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <CardTitle className="text-3xl font-extrabold">{t("title")}</CardTitle>
          <CardDescription className="text-blue-100 mt-2">{t("subtitle")}</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* Search + Download */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-grow w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={t("search.clear")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <Button
              onClick={handleDownloadAll}
              className="bg-green-700 hover:bg-green-800 text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {isGeneratingPdf ? t("buttons.generating") : t("buttons.downloadSummary")}
            </Button>
          </div>

          {/* Summary table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200" ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="font-bold text-blue-800">{t("columns.name")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.email")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.phone")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.casual")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.sick")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.maternity")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.paternity")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.annual")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.other")}</TableHead>
                  <TableHead className="font-bold text-blue-800">{t("columns.total")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {userSummaries.length > 0 ? (
                  userSummaries.map((user) => (
                    <React.Fragment key={`user-summary-${user.email}`}>
                      <TableRow
                        className={[
                          "cursor-pointer hover:bg-blue-50 transition-colors",
                          user.notificationCount > 0 ? "bg-orange-50" : "",
                          user.hasNewNotification ? "ring-1 ring-red-200" : "",
                        ].join(" ")}
                        onClick={() => toggleUser(user.email)}
                      >
                        <TableCell className="font-medium flex items-center text-blue-900">
                          {expandedUsers[user.email] ? (
                            <ChevronDown className="h-4 w-4 mr-2 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2 text-blue-600" />
                          )}

                          <span className="mr-2">{user.name}</span>

                          <span
                            className={[
                              "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                              user.hasNewNotification ? "bg-red-500 text-white animate-pulse" : "bg-gray-200 text-gray-800",
                            ].join(" ")}
                            title={user.hasNewNotification ? t("tooltips.newPending") : t("tooltips.pending")}
                          >
                            ({user.notificationCount})
                          </span>
                        </TableCell>

                        <TableCell className="text-gray-700">{user.email}</TableCell>
                        <TableCell className="text-gray-700">{user.phone}</TableCell>
                        <TableCell className="text-gray-700">{user.casual}</TableCell>
                        <TableCell className="text-gray-700">{user.sick}</TableCell>
                        <TableCell className="text-gray-700">{user.maternity}</TableCell>
                        <TableCell className="text-gray-700">{user.paternity}</TableCell>
                        <TableCell className="text-gray-700">{user.annual}</TableCell>
                        <TableCell className="text-gray-700">{user.other}</TableCell>
                        <TableCell className="font-bold text-blue-900">{user.total}</TableCell>
                      </TableRow>

                      {expandedUsers[user.email] && (
                        <TableRow>
                          <TableCell colSpan={10} className="p-0">
                            <div className="bg-blue-50 px-4 py-2 border-t border-b border-blue-200">
                              <h3 className="text-sm font-semibold text-blue-800 mb-2">{t("details.title")}</h3>
                              <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-md border border-blue-100">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-blue-100">
                                      <TableHead className="text-xs text-blue-700">{t("columns.type")}</TableHead>
                                      <TableHead className="text-xs text-blue-700">{t("columns.from")}</TableHead>
                                      <TableHead className="text-xs text-blue-700">{t("columns.to")}</TableHead>
                                      <TableHead className="text-xs text-blue-700">{t("columns.days")}</TableHead>
                                      <TableHead className="text-xs text-blue-700">{t("columns.reason")}</TableHead>
                                      <TableHead className="text-xs text-blue-700">{t("columns.status")}</TableHead>
                                      <TableHead className="text-xs text-blue-700">{t("columns.requestedOn")}</TableHead>
                                      <TableHead className="text-xs text-blue-700">{t("columns.approvedBy")}</TableHead>
                                      <TableHead className="text-xs text-blue-700">{t("columns.actions")}</TableHead>
                                    </TableRow>
                                  </TableHeader>

                                  <TableBody>
                                    {user.leaves.map((leave, i) => {
                                      const statusL = lower(leave.status);
                                      const isPending = statusL === "pending";
                                      const isRejected = statusL === "rejected";
                                      const isApproved = statusL === "approved";
                                      const typeLabel = lower(leave.leaveType);
                                      return (
                                        <TableRow
                                          key={leave.id}
                                          className={[
                                            i % 2 === 0 ? "bg-white" : "bg-gray-100",
                                            isPending ? "bg-orange-100" : "",
                                            isPending && isRecent(leave.requestDate, 48) ? "ring-1 ring-red-200" : "",
                                          ].join(" ")}
                                        >
                                          <TableCell className="text-xs capitalize">
                                            {typeLabel === "casual" ? t("types.casual")
                                              : typeLabel === "sick" ? t("types.sick")
                                              : typeLabel === "maternity" ? t("types.maternity")
                                              : typeLabel === "paternity" ? t("types.paternity")
                                              : typeLabel === "annual" ? t("types.annual")
                                              : t("types.other")}
                                          </TableCell>

                                          <TableCell className="text-xs">
                                            <time suppressHydrationWarning>{formatDateYMD(leave.fromDate)}</time>
                                          </TableCell>
                                          <TableCell className="text-xs">
                                            <time suppressHydrationWarning>{formatDateYMD(leave.toDate)}</time>
                                          </TableCell>
                                          <TableCell className="text-xs">{leave.days}</TableCell>
                                          <TableCell className="text-xs max-w-xs truncate">{leave.reason}</TableCell>

                                          <TableCell className="text-xs">
                                            <div className="inline-flex items-center gap-2">
                                              <Badge
                                                className={
                                                  isPending
                                                    ? "bg-yellow-500 text-white"
                                                    : isApproved
                                                    ? "bg-green-500 text-white"
                                                    : "bg-red-500 text-white"
                                                }
                                              >
                                                {isPending ? t("status.pending") : isApproved ? t("status.approved") : t("status.rejected")}
                                              </Badge>

                                              {isRejected && (
                                                <button
                                                  type="button"
                                                  title={t("details.viewRejection")}
                                                  onClick={() =>
                                                    setViewReasonModal({
                                                      open: true,
                                                      text: (leave.rejectionReason ?? "").trim() || t("details.noRejectionReason"),
                                                    })
                                                  }
                                                  className="p-1.5 rounded-md text-red-700 hover:bg-red-100"
                                                >
                                                  <Eye className="h-4 w-4" />
                                                </button>
                                              )}
                                            </div>
                                          </TableCell>

                                          <TableCell className="text-xs">
                                            <time suppressHydrationWarning>{formatDateYMD(leave.requestDate)}</time>
                                          </TableCell>
                                          <TableCell className="text-xs">{leave.approvedBy || t("labels.na")}</TableCell>

                                          <TableCell className="text-xs">
                                            <div className="flex gap-1">
                                              <select
                                                value={statusL}
                                                onChange={(e) => handleStatusChange(leave, e.target.value)}
                                                className="text-xs border rounded p-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                              >
                                                <option value="pending">{t("status.pending")}</option>
                                                <option value="approved">{t("status.approved")}</option>
                                                <option value="rejected">{t("status.rejected")}</option>
                                              </select>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                                                onClick={() => handleDownloadSingle(leave)}
                                                disabled={isGeneratingPdf}
                                                aria-label={t("buttons.downloadSingle")}
                                              >
                                                {isGeneratingPdf ? (
                                                  <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                  <Download className="h-3 w-3" />
                                                )}
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
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
                    <TableCell colSpan={10} className="text-center text-gray-500 py-4">
                      {t("empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-md bg-white shadow-lg">
            <div className="border-b px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">{t("reject.title")}</h2>
              <p className="text-xs text-gray-500">{t("reject.subtitle")}</p>
            </div>

            <div className="px-4 py-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("reject.reasonLabel")}
              </label>
              <textarea
                className="min-h-[120px] w-full resize-y rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={t("reject.reasonPlaceholder")}
                value={rejectModal.reason}
                onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button variant="outline" onClick={() => setRejectModal({ open: false, leave: null, reason: "" })}>
                {t("buttons.cancel")}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  const reason = rejectModal.reason.trim();
                  if (!reason) { toast.error(t("reject.reasonRequired")); return; }
                  if (rejectModal.leave) {
                    await updateStatus(rejectModal.leave.id, rejectModal.leave.user.email, "rejected", "Admin", reason);
                  }
                }}
              >
                {t("reject.saveAndReject")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Rejection Reason Modal */}
      {viewReasonModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">{t("details.rejectionTitle")}</h2>
              <button
                type="button"
                aria-label={t("buttons.close")}
                onClick={() => setViewReasonModal({ open: false, text: "" })}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 py-4">
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 whitespace-pre-wrap">
                {viewReasonModal.text}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button variant="outline" onClick={() => setViewReasonModal({ open: false, text: "" })}>
                {t("buttons.ok")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagement;
