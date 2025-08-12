"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Search,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// ---------------- Types ----------------
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

// ---------------- Helpers ----------------
const isRecent = (dateString: string, hours = 48) => {
  const dt = new Date(dateString);
  if (Number.isNaN(dt.getTime())) return false;
  const diffMs = Date.now() - dt.getTime();
  return diffMs / (1000 * 60 * 60) <= hours;
};

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
  return (
    String(d)
      .replace(/[^\d-]/g, "_")
      .slice(0, 10) || "date"
  );
};

const formatDateYMD = (dateString: string) => {
  const dt = new Date(dateString);
  if (Number.isNaN(dt.getTime())) return dateString;
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// =====================================================
// Component — AdminLeaveManagement-style + localization
// =====================================================
export default function EditRequestsPage() {
  const t = useTranslations("editRequests");

  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<EditRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  const tableRef = useRef<HTMLDivElement>(null);
  const html2pdfRef = useRef<any | null>(null);

  const ensureHtml2Pdf = useCallback(async () => {
    if (html2pdfRef.current) return html2pdfRef.current;
    const mod = await import("html2pdf.js/dist/html2pdf.bundle.min.js");
    html2pdfRef.current = (mod as any).default || mod;
    return html2pdfRef.current;
  }, []);

  useEffect(() => {
    fetchEditRequests();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRequests(editRequests);
    } else {
      const q = searchTerm.toLowerCase();
      setFilteredRequests(
        editRequests.filter((r) =>
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.phone && r.phone.includes(q)) ||
          (r.role && r.role.toLowerCase().includes(q)) ||
          (r.reason && r.reason.toLowerCase().includes(q))
        )
      );
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
      toast.error(t("toasts.fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  const groupRequestsByUser = useCallback(
    (requests: EditRequest[]): EditRequestSummary[] => {
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
    },
    []
  );

  const userSummaries = useMemo(
    () => groupRequestsByUser(filteredRequests),
    [filteredRequests, groupRequestsByUser]
  );

  const toggleUser = (email: string) =>
    setExpandedUsers((prev) => ({ ...prev, [email]: !prev[email] }));

  const clearSearch = () => setSearchTerm("");

  const updateStatus = async (
    id: string,
    status: "pending" | "approved" | "rejected"
  ) => {
    try {
      await updateEditRequestStatus(id, status);
      toast.success(t("toasts.statusUpdated"));
      fetchEditRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("toasts.statusUpdateFailed"));
    }
  };

  // ---------- Export summary as PDF (AdminLeave-style) ----------
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
          <h1 style="margin:0;font-size:22px;color:#2d3748">${t("pdf.title")}</h1>
          <p style="margin:6px 0 0 0;font-size:12px;color:#475569">
            ${t("pdf.generatedAt")} ${new Date().toLocaleString()}
          </p>
        </div>
        <div style="font-size:12px;color:#334155">
          ${t("pdf.totalUsers")} <strong>${userSummaries.length}</strong>
        </div>
      `;
      container.appendChild(header);

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.fontSize = "12px";

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          ${[
            t("table.name"),
            t("table.email"),
            t("table.phone"),
            t("table.role"),
            t("table.pending"),
            t("table.approved"),
            t("table.rejected"),
            t("table.total"),
          ]
            .map(
              (h) =>
                `<th style="background:#2d3748;color:#fff;padding:10px;text-align:left;border:1px solid #e2e8f0">${h}</th>`
            )
            .join("")}
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      userSummaries.forEach((u, i) => {
        const tr = document.createElement("tr");
        tr.style.background = i % 2 === 0 ? "#f8fafc" : "#ffffff";
        tr.innerHTML = `
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${u.name}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${u.email}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${u.phone}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${u.role}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${u.pending}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${u.approved}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0">${u.rejected}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;font-weight:700">${u.total}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      container.appendChild(table);

      await html2pdf()
        .set({
          margin: [15, 15],
          filename: `edit_requests_summary_${new Date()
            .toISOString()
            .slice(0, 10)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(container)
        .save();

      toast.success(t("toasts.pdfSuccess"));
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.pdfFailed"));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Card className="w-full mx-auto shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <CardTitle className="text-3xl font-extrabold">
            {t("page.title")}
          </CardTitle>
          <CardDescription className="text-blue-100 mt-2">
            {t("page.subtitle")}
          </CardDescription>
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
              {isGeneratingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGeneratingPdf ? t("actions.generating") : t("actions.downloadSummary")}
            </Button>
          </div>

          <div ref={tableRef} className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="font-bold text-blue-800">{t("table.name")}</TableHead>
                    <TableHead className="font-bold text-blue-800">{t("table.email")}</TableHead>
                    <TableHead className="font-bold text-blue-800">{t("table.phone")}</TableHead>
                    <TableHead className="font-bold text-blue-800">{t("table.role")}</TableHead>
                    <TableHead className="font-bold text-blue-800">{t("table.pending")}</TableHead>
                    <TableHead className="font-bold text-blue-800">{t("table.approved")}</TableHead>
                    <TableHead className="font-bold text-blue-800">{t("table.rejected")}</TableHead>
                    <TableHead className="font-bold text-blue-800">{t("table.total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSummaries.length > 0 ? (
                    userSummaries.map((user) => (
                      <React.Fragment key={`user-summary-${user.email}`}>
                        <TableRow
                          className={[
                            "cursor-pointer hover:bg-blue-50 transition-colors",
                            user.pending > 0 ? "bg-orange-50" : "",
                            user.requests.some((r) => r.status === "pending" && isRecent(r.date))
                              ? "ring-1 ring-red-200"
                              : "",
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
                                user.requests.some((r) => r.status === "pending" && isRecent(r.date))
                                  ? "bg-red-500 text-white animate-pulse"
                                  : "bg-gray-200 text-gray-800",
                              ].join(" ")}
                              title={t("badges.pendingHint")}
                            >
                              ({user.pending})
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-700">{user.email}</TableCell>
                          <TableCell className="text-gray-700">{user.phone}</TableCell>
                          <TableCell className="text-gray-700">{user.role}</TableCell>
                          <TableCell className="text-gray-700">{user.pending}</TableCell>
                          <TableCell className="text-gray-700">{user.approved}</TableCell>
                          <TableCell className="text-gray-700">{user.rejected}</TableCell>
                          <TableCell className="font-bold text-blue-900">{user.total}</TableCell>
                        </TableRow>

                        {expandedUsers[user.email] && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0">
                              <div className="bg-blue-50 px-4 py-2 border-t border-b border-blue-200">
                                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                                  {t("details.title")}
                                </h3>
                                <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-md border border-blue-100">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-blue-100">
                                        <TableHead className="text-xs text-blue-700">{t("details.date")}</TableHead>
                                        <TableHead className="text-xs text-blue-700">{t("details.location")}</TableHead>
                                        <TableHead className="text-xs text-blue-700">{t("details.reason")}</TableHead>
                                        <TableHead className="text-xs text-blue-700">{t("details.status")}</TableHead>
                                        <TableHead className="text-xs text-blue-700">{t("details.actions")}</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {user.requests.map((request, i) => (
                                        <TableRow
                                          key={`${request.email}-${request.date}-${i}`}
                                          className={[
                                            i % 2 === 0 ? "bg-white" : "bg-gray-100",
                                            request.status === "pending" ? "bg-orange-100" : "",
                                          ].join(" ")}
                                        >
                                          <TableCell className="text-xs">
                                            <time suppressHydrationWarning>{formatDateYMD(request.date)}</time>
                                          </TableCell>
                                          <TableCell className="text-xs">
                                            {request.location.division}, {request.location.district}, {request.location.upazila}
                                            {request.location.union ? `, ${request.location.union}` : ""}
                                          </TableCell>
                                          <TableCell className="text-xs max-w-xs truncate">
                                            {request.reason}
                                          </TableCell>
                                          <TableCell className="text-xs">
                                            <span
                                              className={[
                                                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                                                request.status === "pending"
                                                  ? "bg-yellow-500 text-white"
                                                  : request.status === "approved"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-red-500 text-white",
                                              ].join(" ")}
                                            >
                                              {t(`status.${request.status}` as any)}
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-xs">
                                            <div className="flex gap-1">
                                              <select
                                                value={request.status}
                                                onChange={(e) =>
                                                  updateStatus(
                                                    request.id || "",
                                                    e.target.value as "pending" | "approved" | "rejected"
                                                  )
                                                }
                                                className="text-xs border rounded p-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                              >
                                                <option value="pending">{t("status.pending")}</option>
                                                <option value="approved">{t("status.approved")}</option>
                                                <option value="rejected">{t("status.rejected")}</option>
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
                      <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                        {t("messages.noData")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}