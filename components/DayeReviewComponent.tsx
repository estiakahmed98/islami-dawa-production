"use client";

import React, { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { SWRConfig } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { useParentEmail } from "@/hooks/useParentEmail";
import {
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  markaz?: { id: string; name: string } | string | null;
  markazId?: string | null;
}

interface DayeSubmissionStatus {
  email: string;
  name: string;
  hasSubmittedToday: boolean;
  lastSubmissionDate?: string;
  categories: {
    amoli?: boolean;
    moktob?: boolean;
    talim?: boolean;
    daye?: boolean;
    dawati?: boolean;
    dawatimojlish?: boolean;
    jamat?: boolean;
    dinefera?: boolean;
    sofor?: boolean;
  };
  totalSubmissions: number;
  location: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const DayeReviewComponent: React.FC = () => {
  const t = useTranslations("dayeReview");
  const { data: session } = useSession();
  const { getParentEmail } = useParentEmail();

  // SWR fetcher function for category data
  const fetchCategoryData = async (url: string): Promise<any> => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return {};
    const json = await res.json();
    return (json && json.records) || {};
  };

  // Fetch all users using SWR
  const { data: usersData, error: usersError } = useSWR(
    "/api/users",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Process users data
  const allUsers = useMemo(() => {
    if (!usersData) return [];
    const users = Array.isArray(usersData) ? usersData : usersData.users || [];
    return users;
  }, [usersData]);
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "submitted" | "not-submitted"
  >("all");

  // Helper: format to yyyy-mm-dd in Dhaka timezone
  const dhakaYMD = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

  // Helper: format to Month DD, YYYY in Dhaka timezone (client-side only)
  const dhakaFormatted = (dateString: string) => {
    if (typeof window === "undefined") return dateString; // Fallback for SSR
    const date = new Date(dateString + "T00:00:00");
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Hydration-safe initial date (client only)
  useEffect(() => {
    setSelectedDate(dhakaYMD(new Date()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remove the old fetchDayees useEffect since we're using SWR

  // Apply hierarchy scoping (who can see whose data)
  useEffect(() => {
    if (!session?.user?.email || allUsers.length === 0) return;

    const loggedInUser =
      allUsers.find((u: User) => u.email === session.user.email) || null;

    // If we can't map the logged-in user to the directory, only show self (if present)
    if (!loggedInUser) {
      setVisibleUsers(allUsers.filter((u: User) => u.email === session.user.email));
      return;
    }

    // Central admin can see everyone
    if (loggedInUser.role === "centraladmin") {
      setVisibleUsers(allUsers);
      return;
    }

    const allowedEmails = new Set<string>([loggedInUser.email]);

    const collectChildren = (parentEmail: string) => {
      allUsers.forEach((user: User) => {
        const parentEmailForUser = getParentEmail(user, allUsers, loggedInUser);

        if (parentEmailForUser === parentEmail && user.email) {
          if (allowedEmails.has(user.email)) return;
          allowedEmails.add(user.email);
          collectChildren(user.email);
        }
      });
    };

    collectChildren(loggedInUser.email);
    setVisibleUsers(allUsers.filter((u: User) => allowedEmails.has(u.email)));
  }, [allUsers, getParentEmail, session?.user?.email]);

  // Fetch submission status for all users using SWR
  const { data: submissionData, error: submissionError, isLoading: submissionLoading } = useSWR(
    selectedDate && visibleUsers.length > 0
      ? [
          "submission-status",
          selectedDate,
          visibleUsers.map((u) => u.email).join(",")
        ]
      : null,
    async () => {
      if (!selectedDate || visibleUsers.length === 0) return [];
      
      const emails = visibleUsers.map((d) => d.email).join(",");
      
      // Fetch all category data
      const endpoints = [
        { key: "amoli", url: "/api/amoli" },
        { key: "moktob", url: "/api/moktob" },
        { key: "talim", url: "/api/talim" },
        { key: "daye", url: "/api/dayi" },
        { key: "dawati", url: "/api/dawati" },
        { key: "dawatimojlish", url: "/api/dawatimojlish" },
        { key: "jamat", url: "/api/jamat" },
        { key: "dinefera", url: "/api/dinefera" },
        { key: "sofor", url: "/api/soforbisoy" },
      ];

      const results = await Promise.all(
        endpoints.map(async (ep) => {
          try {
            const data = await fetchCategoryData(`${ep.url}?emails=${encodeURIComponent(emails)}`);
            return { key: ep.key, data };
          } catch {
            return { key: ep.key, data: {} };
          }
        })
      );

      // Process submission status
      const statusList: DayeSubmissionStatus[] = visibleUsers.map((daye) => {
        const categories: any = {};
        let hasSubmittedToday = false;
        let totalSubmissions = 0;
        let lastSubmissionDate: string | undefined;

        results.forEach(({ key, data }) => {
          const emailData = (data as any)[daye.email];

          // Normalize records array
          let records: any[] = [];
          if (Array.isArray(emailData)) {
            records = emailData;
          } else if (emailData && Array.isArray(emailData.records)) {
            records = emailData.records;
          }

          if (records.length > 0) {
            // Check per selectedDate (Dhaka)
            const hasOnSelected = records.some((r) => {
              const ymd = dhakaYMD(new Date(r.date));
              return ymd === selectedDate;
            });
            categories[key] = hasOnSelected;
            if (hasOnSelected) {
              hasSubmittedToday = true;
              totalSubmissions++;
            }

            // Track last submission date across categories
            const latest = records.reduce(
              (acc: string | undefined, r: any) => {
                const ymd = dhakaYMD(new Date(r.date));
                return !acc || ymd > acc ? ymd : acc;
              },
              lastSubmissionDate
            );
            lastSubmissionDate = latest;
          } else {
            categories[key] = false;
          }
        });

        const getMarkazName = (u: User): string => {
          if (!u.markaz) return "";
          return typeof u.markaz === "string"
            ? u.markaz
            : u.markaz.name || "";
        };

        const location = [
          daye.division,
          daye.district,
          daye.upazila,
          getMarkazName(daye),
        ]
          .filter(Boolean)
          .join(", ");

        return {
          email: daye.email,
          name: daye.name,
          hasSubmittedToday,
          lastSubmissionDate,
          categories,
          totalSubmissions,
          location,
        };
      });

      return statusList;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Update submission status from SWR data
  const submissionStatus = submissionData || [];
  const loading = submissionLoading || !allUsers.length;

  // Filter and search
  const filteredStatus = useMemo(() => {
    return submissionStatus.filter((status) => {
      const matchesSearch =
        status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "submitted" && status.hasSubmittedToday) ||
        (filterStatus === "not-submitted" && !status.hasSubmittedToday);

      return matchesSearch && matchesFilter;
    });
  }, [submissionStatus, searchQuery, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = submissionStatus.length;
    const submitted = submissionStatus.filter(
      (s) => s.hasSubmittedToday
    ).length;
    const notSubmitted = total - submitted;
    const percentage = total > 0 ? ((submitted / total) * 100).toFixed(1) : "0";

    return { total, submitted, notSubmitted, percentage };
  }, [submissionStatus]);

  const exportToPDF = async () => {
    if (typeof window === "undefined") return;

    const columns: Array<{ key: string; label: string }> = [
      { key: "name", label: "ব্যবহারকারীর নাম" },
      { key: "amoli", label: "আমলী" },
      { key: "moktob", label: "মক্তব" },
      { key: "talim", label: "তালিম" },
      { key: "daye", label: "দা'ঈ" },
      { key: "dawati", label: "দাওয়াতি" },
      { key: "dawatimojlish", label: "দাওয়াতি মজলিশ" },
      { key: "jamat", label: "জামাত" },
      { key: "dinefera", label: "দ্বীনি ফেরা" },
      { key: "sofor", label: "সফর" },
    ];

    const rows = filteredStatus.map((status) => {
      const row: Record<string, string> = { name: status.name };
      columns.slice(1).forEach((col) => {
        const isDone = status.categories[col.key as keyof typeof status.categories];
        row[col.key] = isDone ? "DONE" : "NOT DONE";
      });
      return row;
    });

    const exporterName = session?.user?.name || "Unknown";
    const exporterRole = session?.user?.role || "Unknown";

    const html = `
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                @page {
                  size: landscape;
                  margin: 10mm;
                }

                body {
                  font-family: Arial, "Noto Sans Bengali", sans-serif;
                  padding: 6px;
                  margin: 0;
                  font-size: 10.5px;
                  color: #111827;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }

                .header {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  grid-template-rows: auto auto;
                  column-gap: 12px;
                  row-gap: 4px;
                  align-items: end;
                  margin-bottom: 10px;
                }

                h1 {
                  grid-column: 1 / -1;
                  text-align: center;
                  color: #111827;
                  font-size: 16px;
                  font-weight: 800;
                  letter-spacing: 0.2px;
                  margin: 0 0 2px 0;
                }

                h2 {
                  color: #777;
                  font-size: 10px;
                  margin-top: 0;
                  margin-bottom: 8px;
                }

                h3 {
                  color: #4b5563;
                  font-size: 11px;
                  font-weight: 700;
                  margin: 0;
                }

                .header h3:first-of-type {
                  grid-column: 2 / 3;
                  text-align: center;
                }

                .header h3:last-of-type {
                  grid-column: 3 / 4;
                  text-align: right;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 9.5px;
                  border: 1px solid #cbd5e1;
                }

                thead {
                  display: table-header-group;
                }

                tr {
                  height: 26px;
                }

                th, td {
                  border: 1px solid #cbd5e1;
                  padding: 6px;
                  text-align: center;
                  vertical-align: middle;
                  line-height: 1.2;
                  white-space: nowrap;
                }

                th {
                  background-color: #f3f4f6;
                  font-weight: 800;
                  font-size: 11px;
                }

                tbody tr:nth-child(even) {
                  background-color: #f9fafb;
                }

                td.name-cell {
                  font-weight: 800;
                  font-size: 10.5px;
                  white-space: normal;
                  text-align: center;
                  min-width: 140px;
                }

                .done {
                  background-color: #008080;
                  color: #ffffff;
                  font-weight: bold;
                }

                .not-done {
                  color: #333333;
                  font-weight: bold;
                }

                /* 🔹 force page break after every 28 rows */
                tbody tr:nth-child(28n) {
                  page-break-after: always;
                }
              </style>
            </head>

            <body>
              <div class="header">
                <h1>দা'ঈ দৈনিক জমা প্রতিবেদন</h1>
                <h3>তারিখ: ${dhakaFormatted(selectedDate)}</h3>
                <h3>প্রতিবেদন প্রস্তুতকারী: ${exporterName} (${exporterRole})</h3>
              </div>

              <table>
                <thead>
                  <tr>
                    ${columns.map((c) => `<th>${c.label}</th>`).join("")}
                  </tr>
                </thead>
               <tbody>
                  ${rows
                    .map(
                      (row) => `
                    <tr>
                      ${columns
                        .map((col, index) => {
                          const value = row[col.key] || "";

                          // ✅ FIRST COLUMN = NAME
                          if (index === 0) {
                             return `<td class="name-cell">${value}</td>`;
                          }

                          // ✅ STATUS COLUMNS
                          const cls =
                            value === "DONE" ? "done" : value === "NOT DONE" ? "not-done" : "";

                          const displayValue =
                            value === "DONE"
                              ? "সম্পন্ন"
                              : value === "NOT DONE"
                                ? "অসম্পন্ন"
                                : "";

                          return `<td class="${cls}">${displayValue}</td>`;
                        })
                        .join("")}
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </body>
    </html>
    `;

    const element = document.createElement("div");
    element.innerHTML = html;

    const opt = {
      margin: 10,
      filename: `daye-report-${selectedDate}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    const html2pdf = (await import("html2pdf.js")).default as any;
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full pl-10" />
            <Skeleton className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-20" />
            ))}
          </div>
        </div>

        {/* Daye List Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-5 w-5" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-4 w-40 mb-2" />
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, j) => (
                        <Skeleton key={j} className="h-6 w-full" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 300000, // 5 minutes
      }}
    >
      <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t("header.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("header.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalDaee")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              {t("stats.submittedTitle")}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {stats.submitted}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {stats.percentage}% {t("stats.completedPercent")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              {t("stats.notSubmittedTitle")}
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {stats.notSubmitted}
            </div>
            <p className="text-xs text-red-600 mt-1">
              {(100 - parseFloat(stats.percentage)).toFixed(1)}%{" "}
              {t("stats.remainingPercent")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.progress")}
            </CardTitle>
            {parseFloat(stats.percentage) >= 50 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("stats.completeness")}: {stats.percentage}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
            className={filterStatus === "all" ? "text-white" : ""}
          >
            {t("filters.all")} ({submissionStatus.length})
          </Button>
          <Button
            variant={filterStatus === "submitted" ? "default" : "outline"}
            onClick={() => setFilterStatus("submitted")}
            size="sm"
            className={
              filterStatus === "submitted"
                ? "text-white"
                : "text-green-600 hover:text-white hover:bg-green-700"
            }
          >
            {t("filters.submitted")} ({stats.submitted})
          </Button>
          <Button
            variant={filterStatus === "not-submitted" ? "default" : "outline"}
            onClick={() => setFilterStatus("not-submitted")}
            size="sm"
            className={
              filterStatus === "not-submitted"
                ? "text-white"
                : "text-red-600 hover:text-white hover:bg-red-700"
            }
          >
            {t("filters.notSubmitted")} ({stats.notSubmitted})
          </Button>
          <Button
            onClick={exportToPDF}
            size="sm"
            variant="outline"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Daye List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredStatus.map((status) => (
          <Card
            key={status.email}
            className={`transition-all ${
              status.hasSubmittedToday
                ? "border-green-200 bg-green-50/30"
                : "border-red-200 bg-red-50/30"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {status.name}
                    {status.hasSubmittedToday ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {status.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    📍 {status.location || t("list.locationUnknown")}
                  </p>
                </div>
                <Badge
                  variant={status.hasSubmittedToday ? "default" : "destructive"}
                  className={
                    status.hasSubmittedToday ? "bg-green-600" : "bg-red-600"
                  }
                >
                  {status.hasSubmittedToday
                    ? t("badge.completed")
                    : t("badge.incomplete")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">
                    {t("details.todaySummary")} ({status.totalSubmissions}/9):
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "amoli", label: t("categories.amoli") },
                      { key: "moktob", label: t("categories.moktob") },
                      { key: "talim", label: t("categories.talim") },
                      { key: "daye", label: t("categories.daye") },
                      { key: "dawati", label: t("categories.dawati") },
                      {
                        key: "dawatimojlish",
                        label: t("categories.dawatimojlish"),
                      },
                      { key: "jamat", label: t("categories.jamat") },
                      { key: "dinefera", label: t("categories.dinefera") },
                      { key: "sofor", label: t("categories.sofor") },
                    ].map((cat) => (
                      <Badge
                        key={cat.key}
                        variant="outline"
                        className={`text-xs ${
                          status.categories[
                            cat.key as keyof typeof status.categories
                          ]
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                      >
                        {cat.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                {status.lastSubmissionDate && (
                  <p className="text-xs font-semibold text-green-600">
                    {t("details.lastSubmission")}{" "}
                    {new Date(status.lastSubmissionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStatus.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("empty.noResults")}</p>
          </CardContent>
        </Card>
      )}
    </div>
    </SWRConfig>
  );
};

export default DayeReviewComponent;
