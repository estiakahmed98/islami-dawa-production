"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit, Download, Calendar, Filter, X } from "lucide-react";
import AdminDayeeFiveEditForm from "./AdminDayeeFiveEditForm";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type DayeeFiveRecord = {
  id: string;
  month: number;
  year: number;
  shobgojariDate?: string | null;
  mashwaraDate?: string | null;
  trainingDates?: string[];
  jamatCount: number;
  gashtCount: number;
  editorContent?: string | null;
  createdAt?: string | null;
  user?: {
    name?: string | null;
    district?: string | null;
    email?: string | null;
    role?: string | null;
    division?: string | null;
    markaz?: any;
  };
};

type User = {
  email: string;
  role: string;
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  markaz?: any;
  name?: string | null;
};

const banglaMonths = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

function formatDate(date?: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("bn-BD", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

const getRecordMonth = (record: DayeeFiveRecord) => {
  return `${banglaMonths[record.month - 1]} ${record.year}`;
};

function formatDateTime(date?: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("bn-BD", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function AdminDayeeFiveTable() {
  const { data: session } = useSession();
  const loggedInUser = session?.user as User | null;

  const [records, setRecords] = useState<DayeeFiveRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [editingRecord, setEditingRecord] = useState<DayeeFiveRecord | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Month range filter states
  const [showMonthRangeFilter, setShowMonthRangeFilter] = useState(false);
  const [startMonth, setStartMonth] = useState<number>(0);
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState<number>(11);
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear());
  const [useMonthRange, setUseMonthRange] = useState(false);
  const [exportInfo, setExportInfo] = useState<{
    exportedBy: string;
    exportedAt: Date;
    filterInfo: string;
    totalRecords: number;
  } | null>(null);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        setAllUsers(json.users || []);
      } catch (error) {
        console.error(error);
        toast.error("ইউজার লোড করতে সমস্যা হয়েছে");
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!loggedInUser?.email) return;

      try {
        setLoading(true);

        const url = useMonthRange
          ? "/api/dayee-five/admin"
          : `/api/dayee-five/admin?month=${selectedMonth + 1}&year=${selectedYear}`;

        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) throw new Error("Failed to fetch records");

        const json = await res.json();
        setRecords(json.records || []);
      } catch (error) {
        console.error(error);
        toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [
    loggedInUser?.email,
    selectedMonth,
    selectedYear,
    useMonthRange,
    startMonth,
    startYear,
    endMonth,
    endYear,
  ]);

  // Role based filtering
  const filterRecordsByRole = (recordsToFilter: DayeeFiveRecord[]) => {
    if (!loggedInUser) return [];

    return recordsToFilter.filter((record) => {
      const user = record.user;
      if (!user) return false;

      // CENTRAL ADMIN -> see all
      if (loggedInUser.role === "centraladmin") {
        return true;
      }

      // DIVISION ADMIN -> same division er sob data
      if (loggedInUser.role === "divisionadmin") {
        return user.division === loggedInUser.division;
      }

      // MARKAZ ADMIN -> same markaz er sob data
      if (loggedInUser.role === "markazadmin") {
        const loggedMarkaz =
          typeof loggedInUser.markaz === "object"
            ? loggedInUser.markaz?.id
            : loggedInUser.markaz;

        const userMarkaz =
          typeof user.markaz === "object" ? user.markaz?.id : user.markaz;

        return loggedMarkaz === userMarkaz;
      }

      // DAYE -> only own data
      if (loggedInUser.role === "daye") {
        return user.email === loggedInUser.email;
      }

      return false;
    });
  };

  // Filter records by month range
  const filterRecordsByMonthRange = (recordsToFilter: DayeeFiveRecord[]) => {
    if (!useMonthRange) return recordsToFilter;

    return recordsToFilter.filter((record) => {
      const recordDate = new Date(record.year, record.month - 1);
      const start = new Date(startYear, startMonth);
      const end = new Date(endYear, endMonth);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);

      return recordDate >= start && recordDate <= end;
    });
  };

  // Get filtered records with role and month range
  const getFilteredRecords = () => {
    let filtered = filterRecordsByRole(records);

    if (useMonthRange) {
      filtered = filterRecordsByMonthRange(filtered);
    }

    return filtered;
  };

  const filteredRecords = getFilteredRecords();

  const getFilterInfo = () => {
    let info = "";

    if (useMonthRange) {
      info = `${banglaMonths[startMonth]} ${startYear} - ${banglaMonths[endMonth]} ${endYear} (মাসিক রেঞ্জ)`;
    } else {
      info = `${banglaMonths[selectedMonth]} ${selectedYear}`;
    }

    // Add role info
    if (loggedInUser?.role === "divisionadmin") {
      info += ` | বিভাগ: ${loggedInUser.division || "সব"}`;
    } else if (loggedInUser?.role === "markazadmin") {
      info += ` | মারকাজ ফিল্টার করা`;
    }

    return info;
  };

  const exportToPDF = async () => {
    if (typeof window === "undefined") return;

    try {
      setIsExporting(true);

      if (!filteredRecords.length) {
        toast.error("PDF করার মতো কোনো রিপোর্ট নেই");
        return;
      }

      const now = new Date();
      const exporterName = loggedInUser?.name || "অজানা ব্যবহারকারী";
      const exportDateTime = formatDateTime(now);
      const filterInfo = getFilterInfo();

      const columns = [
        "ক্রমিক",
        "দায়ীর নাম",
        "জেলা",
        "মাস",
        "শবগুজারি",
        "মাসওয়ারা",
        "প্রশিক্ষণ",
        "জামাত",
        "গাস্ত",
        "মন্তব্য",
      ];

      const firstPageChunkSize = 8;
      const otherPageChunkSize = 10;

      const rowChunks: DayeeFiveRecord[][] = [];

      rowChunks.push(filteredRecords.slice(0, firstPageChunkSize));

      for (
        let i = firstPageChunkSize;
        i < filteredRecords.length;
        i += otherPageChunkSize
      ) {
        rowChunks.push(filteredRecords.slice(i, i + otherPageChunkSize));
      }

      const stripHtml = (html?: string | null) =>
        html ? html.replace(/<[^>]*>/g, "") : "";

      const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
              @page {
                size: landscape;
                margin: 8mm;
              }

              body {
                font-family: Arial, "Noto Sans Bengali", sans-serif;
                margin: 0;
                padding: 0;
                color: #111827;
                font-size: 13px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

            .page {
              width: 100%;
              page-break-after: always;
              break-after: page;
              box-sizing: border-box;
              padding: 0;
              overflow: visible;
            }

            .page:last-child {
              page-break-after: auto;
              break-after: auto;
            }

              .header {
                margin-bottom: 14px;
                border-bottom: 1px solid #111827;
                padding-bottom: 10px;
              }

              h1 {
                text-align: center;
                font-size: 24px;
                font-weight: 800;
                margin: 0 0 12px 0;
              }

              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px 20px;
                font-size: 13px;
              }

              .info-item {
                color: #374151;
                font-weight: 600;
              }

              .info-item strong {
                color: #111827;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                margin-top: 14px;
                font-size: 12px;
              }

              th,
              td {
                border: 1px solid #111827;
                padding: 8px 5px;
                text-align: center;
                vertical-align: middle;
                line-height: 1.35;
                word-break: break-word;
              }

              th {
                background-color: #e5e7eb;
                font-weight: 800;
                font-size: 13px;
              }

              tbody tr:nth-child(even) {
                background-color: #f9fafb;
              }

              .serial {
                width: 45px;
                font-weight: 700;
              }

              .name {
                width: 130px;
                font-weight: 800;
              }

              .month-cell {
                width: 90px;
                font-weight: 700;
              }

              .district {
                width: 100px;
              }

              .date-cell {
                width: 95px;
              }

              .training {
                width: 150px;
              }

              .count-cell {
                width: 60px;
                font-weight: 700;
              }

              .comment {
                width: 220px;
                text-align: left;
                white-space: normal;
              }
          </style>
        </head>

        <body>
          ${rowChunks
            .map(
              (chunkRows, chunkIndex) => `
                  <div class="page">
                    ${
                      chunkIndex === 0
                        ? `
    <div class="header">
      <h1>দায়ীদের মাসিক ৫ কাজের প্রতিবেদন</h1>

      <div class="info-grid">
        <div class="info-item">
          <strong>ফিল্টার তথ্য:</strong> ${filterInfo}
        </div>

        <div class="info-item">
          <strong>মোট রিপোর্ট:</strong> ${filteredRecords.length} টি
        </div>

        <div class="info-item">
          <strong>রিপোর্ট করেছেন:</strong> ${exporterName}
        </div>

        <div class="info-item">
          <strong>রিপোর্ট সময়:</strong> ${exportDateTime}
        </div>
      
        <div class="info-item">
          <strong>ভূমিকা:</strong> ${loggedInUser?.role || "N/A"}
        </div>
      </div>
    </div>
  `
                        : ""
                    }

                    <table>
                    <thead>
                      <tr>
                        ${columns.map((col) => `<th>${col}</th>`).join("")}
                      </tr>
                    </thead>

                    <tbody>
                      ${chunkRows
                        .map((record, index) => {
                          const serial =
                            chunkIndex === 0
                              ? index + 1
                              : firstPageChunkSize +
                                (chunkIndex - 1) * otherPageChunkSize +
                                index +
                                1;

                          return `
                            <tr>
                              <td class="serial">${String(serial).padStart(2, "0")}</td>
                              <td class="name">${record.user?.name || "-"}</td>
                              <td class="district">${record.user?.district || "-"}</td>
                              <td class="month-cell">${getRecordMonth(record)}</td>
                              <td class="date-cell">${formatDate(record.shobgojariDate) || "✓"}</td>
                              <td class="date-cell">${formatDate(record.mashwaraDate) || "✓"}</td>
                              <td class="training">
                                ${
                                  record.trainingDates?.length
                                    ? record.trainingDates
                                        .map(formatDate)
                                        .join("<br/>")
                                    : "✓"
                                }
                              </td>
                              <td class="count-cell">${record.jamatCount}</td>
                              <td class="count-cell">${record.gashtCount}</td>
                              <td class="comment">${stripHtml(record.editorContent)}</td>
                            </tr>
                          `;
                        })
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `,
            )
            .join("")}
        </body>
      </html>
    `;

      const element = document.createElement("div");
      element.innerHTML = html;

      const html2pdf = (await import("html2pdf.js")).default as any;

      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          pagebreak: {
            mode: ["css", "legacy"],
            after: ".page",
            avoid: ["tr"],
          },
          filename: `dayee-five-report-${filterInfo.replace(/\s+/g, "-")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "landscape",
          },
        })
        .from(element)
        .save();

      setExportInfo({
        exportedBy: exporterName,
        exportedAt: now,
        filterInfo: filterInfo,
        totalRecords: filteredRecords.length,
      });

      toast.success("PDF সফলভাবে ডাউনলোড হয়েছে");

      setTimeout(() => setExportInfo(null), 5000);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("PDF তৈরি করতে ব্যর্থ হয়েছে");
    } finally {
      setIsExporting(false);
    }
  };

  const clearMonthRange = () => {
    setStartMonth(0);
    setStartYear(new Date().getFullYear());
    setEndMonth(11);
    setEndYear(new Date().getFullYear());
    setUseMonthRange(false);
    setShowMonthRangeFilter(false);
  };

  const applyMonthRange = () => {
    if (startYear && endYear) {
      setUseMonthRange(true);
      setShowMonthRangeFilter(false);
      toast.success("মাসিক রেঞ্জ প্রয়োগ করা হয়েছে");
    } else {
      toast.error("দয়া করে সঠিক বছর নির্বাচন করুন");
    }
  };

  const resetToMonthFilter = () => {
    setUseMonthRange(false);
    setShowMonthRangeFilter(false);
    toast.success("মাসিক ফিল্টারে ফিরে গেছে");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white p-4">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold">
            দায়ীদের মাসিক ৫ কাজের প্রতিবেদন
          </h1>
          <h2 className="mt-2 text-xl font-semibold">
            {useMonthRange
              ? `${banglaMonths[startMonth]} ${startYear} - ${banglaMonths[endMonth]} ${endYear} (মাসিক রেঞ্জ)`
              : `মাসঃ ${banglaMonths[selectedMonth]} ${selectedYear}`}
          </h2>
          {filteredRecords.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              মোট রেকর্ড সংখ্যা: {filteredRecords.length} টি
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Info Display */}
          {exportInfo && (
            <div className="absolute right-4 top-20 z-10 rounded-lg bg-green-50 p-3 shadow-md lg:right-4 lg:top-24">
              <div className="flex items-start gap-2">
                <div className="text-green-600">
                  <Download className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-green-800">এক্সপোর্ট সফল!</p>
                  <p className="text-xs text-green-700">
                    প্রস্তুতকারী: {exportInfo.exportedBy}
                  </p>
                  <p className="text-xs text-green-700">
                    সময়: {formatDateTime(exportInfo.exportedAt)}
                  </p>
                  <p className="text-xs text-green-700">
                    মোট রেকর্ড: {exportInfo.totalRecords} টি
                  </p>
                </div>
                <button
                  onClick={() => setExportInfo(null)}
                  className="text-green-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Month Range Filter Button */}
          <Button
            variant={useMonthRange ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMonthRangeFilter(!showMonthRangeFilter)}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">
              {useMonthRange ? "মাসিক রেঞ্জ সক্রিয়" : "মাসিক রেঞ্জ"}
            </span>
          </Button>

          {useMonthRange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToMonthFilter}
              className="flex items-center gap-1 text-red-500"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">সিঙ্গেল মাস</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            disabled={isExporting}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isExporting ? "প্রস্তুত হচ্ছে..." : "PDF"}
            </span>
          </Button>

          {/* Regular Month Selectors (only show when not using month range) */}
          {!useMonthRange && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="rounded border px-3 py-2"
              >
                {banglaMonths.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-28 rounded border px-3 py-2"
              />
            </>
          )}
        </div>
      </div>

      {/* Month Range Filter Panel */}
      {showMonthRangeFilter && (
        <div className="mb-4 rounded-lg border bg-gray-50 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                শুরু মাস
              </label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="mt-1 rounded border px-3 py-2"
              >
                {banglaMonths.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                শুরু বছর
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="mt-1 w-28 rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                শেষ মাস
              </label>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
                className="mt-1 rounded border px-3 py-2"
              >
                {banglaMonths.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                শেষ বছর
              </label>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="mt-1 w-28 rounded border px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={applyMonthRange} size="sm">
                <Filter className="mr-1 h-4 w-4" />
                প্রয়োগ করুন
              </Button>
              <Button onClick={clearMonthRange} variant="ghost" size="sm">
                মুছে ফেলুন
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            * মাসিক রেঞ্জ নির্বাচন করলে নির্দিষ্ট সময়ের মধ্যে সকল রিপোর্ট
            দেখাবে
          </p>
        </div>
      )}

      {/* Report Table */}
      <div ref={tableRef} className="report-table-container">
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black px-2 py-2">ক্রমিক</th>
              <th className="border border-black px-2 py-2">দায়ীর নাম</th>
              <th className="border border-black px-2 py-2">জেলা</th>
              <th className="border border-black px-2 py-2">মাস</th>
              <th className="border border-black px-2 py-2">শবগুজারি</th>
              <th className="border border-black px-2 py-2">মাসওয়ারা</th>
              <th className="border border-black px-2 py-2">প্রশিক্ষণ</th>
              <th className="border border-black px-2 py-2">জামাত</th>
              <th className="border border-black px-2 py-2">গাস্ত</th>
              <th className="border border-black px-2 py-2">মন্তব্য</th>
              <th className="border border-black px-2 py-2">এডিট</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="border border-black px-2 py-2 text-center">
                    {String(index + 1).padStart(2, "0")}
                  </td>

                  <td className="border border-black px-2 py-2 font-medium">
                    {record.user?.name || "-"}
                  </td>

                  <td className="border border-black px-2 py-2">
                    {record.user?.district || "-"}
                  </td>

                  <td className="border border-black px-2 py-2 text-center">
                    {getRecordMonth(record)}
                  </td>

                  <td className="border border-black px-2 py-2 text-center">
                    {formatDate(record.shobgojariDate) || "✓"}
                  </td>

                  <td className="border border-black px-2 py-2 text-center">
                    {formatDate(record.mashwaraDate) || "✓"}
                  </td>

                  <td className="border border-black px-2 py-2 text-center">
                    {record.trainingDates?.length
                      ? record.trainingDates.map(formatDate).join(", ")
                      : "✓"}
                  </td>

                  <td className="border border-black px-2 py-2 text-center">
                    {record.jamatCount}
                  </td>

                  <td className="border border-black px-2 py-2 text-center">
                    {record.gashtCount}
                  </td>

                  <td
                    className="border border-black px-2 py-2 max-w-xs break-words"
                    dangerouslySetInnerHTML={{
                      __html: record.editorContent || "",
                    }}
                  />

                  <td className="border border-black px-2 py-2 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingRecord(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="border border-black px-4 py-6 text-center text-gray-500"
                >
                  {useMonthRange
                    ? `${banglaMonths[startMonth]} ${startYear} - ${banglaMonths[endMonth]} ${endYear} সময়ের মধ্যে কোনো রিপোর্ট পাওয়া যায়নি`
                    : "এই মাসের কোনো রিপোর্ট পাওয়া যায়নি"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">রিপোর্ট এডিট করুন</h2>
              <Button variant="outline" onClick={() => setEditingRecord(null)}>
                বন্ধ করুন
              </Button>
            </div>

            <AdminDayeeFiveEditForm
              record={editingRecord}
              onSuccess={() => {
                setEditingRecord(null);
                // Refresh records
                const fetchRecords = async () => {
                  if (!loggedInUser?.email) return;

                  try {
                    setLoading(true);
                    const res = await fetch(
                      `/api/dayee-five/admin?month=${selectedMonth + 1}&year=${selectedYear}`,
                      { cache: "no-store" },
                    );

                    if (!res.ok) throw new Error("Failed to fetch records");

                    const json = await res.json();
                    setRecords(json.records || []);
                  } catch (error) {
                    console.error(error);
                    toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
                  } finally {
                    setLoading(false);
                  }
                };

                fetchRecords();
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .report-table-container {
            margin: 0;
            padding: 0;
          }
          table {
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
