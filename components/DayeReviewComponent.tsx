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
  onLeave?: boolean;
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

interface LeaveRequest {
  id: string;
  status: string;
  fromDate: string;
  toDate: string;
  user?: {
    email?: string | null;
  } | null;
  email?: string | null;
}

type MonthlyUserDayStatus = {
  email: string;
  name: string;
  location: string;
  days: Record<
    number,
    {
      submitted: number;
      onLeave: boolean;
    }
  >;
};

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
  const { data: usersData, error: usersError } = useSWR("/api/users", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000, // 5 minutes
  });

  // Process users data
  const allUsers = useMemo(() => {
    if (!usersData) return [];
    const users = Array.isArray(usersData) ? usersData : usersData.users || [];
    return users;
  }, [usersData]);
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [reviewMode, setReviewMode] = useState<"daily" | "monthly">("daily");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
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

  const monthOptions = useMemo(
    () => [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    [],
  );

  const categoryOptions = useMemo(
    () => [
      { key: "amoli", label: "আ'মলি", url: "/api/amoli" },
      { key: "moktob", label: "মক্তব", url: "/api/moktob" },
      { key: "talim", label: "তালিম", url: "/api/talim" },
      { key: "daye", label: "দা'ঈ", url: "/api/dayi" },
      { key: "dawati", label: "দাওয়াতি", url: "/api/dawati" },
      {
        key: "dawatimojlish",
        label: "দাওয়াতি মজলিশ",
        url: "/api/dawatimojlish",
      },
      { key: "jamat", label: "জামাত", url: "/api/jamat" },
      { key: "dinefera", label: "দ্বীনে ফেরা", url: "/api/dinefera" },
      { key: "sofor", label: "সফর", url: "/api/soforbisoy" },
    ],
    [],
  );

  const monthlyStartEnd = useMemo(() => {
    const y = selectedYear;
    const m = selectedMonth;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const end = `${y}-${String(m + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    return { start, end, daysInMonth };
  }, [selectedMonth, selectedYear]);

  const { data: monthlyUserData, isLoading: monthlyLoading } = useSWR(
    reviewMode === "monthly" && visibleUsers.length > 0
      ? [
          "monthly-user-day-stats",
          `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`,
          visibleUsers.map((u) => u.email).join(","),
        ]
      : null,
    async () => {
      const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      const daysInMonth = monthlyStartEnd.daysInMonth;

      const results = await Promise.all(
        categoryOptions.map(async (cat) => {
          const userResults = await Promise.all(
            visibleUsers.map(async (user) => {
              try {
                const res = await fetch(
                  `${cat.url}?email=${encodeURIComponent(user.email)}`,
                  { cache: "no-store" },
                );

                if (!res.ok) {
                  return { email: user.email, records: [] as any[] };
                }

                const json = await res.json();

                const records = Array.isArray(json)
                  ? json
                  : Array.isArray((json as any)?.records)
                    ? (json as any).records
                    : [];

                return { email: user.email, records };
              } catch {
                return { email: user.email, records: [] as any[] };
              }
            }),
          );

          return {
            key: cat.key,
            users: userResults,
          };
        }),
      );

      const getMarkazName = (u: User): string => {
        if (!u.markaz) return "";
        return typeof u.markaz === "string" ? u.markaz : u.markaz.name || "";
      };

      const monthlyUsers: MonthlyUserDayStatus[] = visibleUsers.map((user) => {
        const days: MonthlyUserDayStatus["days"] = {};

        for (let day = 1; day <= daysInMonth; day++) {
          days[day] = {
            submitted: 0,
            onLeave: false,
          };
        }

        categoryOptions.forEach((cat) => {
          const categoryResult = results.find((r) => r.key === cat.key);
          const userResult = categoryResult?.users.find(
            (u) => u.email === user.email,
          );

          const submittedDaySet = new Set<number>();

          userResult?.records.forEach((record: any) => {
            if (!record?.date) return;

            const ymd = dhakaYMD(new Date(record.date));

            if (!ymd.startsWith(monthKey)) return;

            const day = Number(ymd.slice(8, 10));

            if (!Number.isFinite(day) || day < 1 || day > daysInMonth) return;

            submittedDaySet.add(day);
          });

          submittedDaySet.forEach((day) => {
            days[day].submitted += 1;
          });
        });

        const location = [
          user.division,
          user.district,
          user.upazila,
          getMarkazName(user),
        ]
          .filter(Boolean)
          .join(", ");

        return {
          email: user.email,
          name: user.name,
          location,
          days,
        };
      });

      return {
        users: monthlyUsers,
        daysInMonth,
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    },
  );

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

  const isOnLeaveForSelectedDate = (
    leave: LeaveRequest,
    selectedYmd: string,
  ) => {
    const fromYmd = dhakaYMD(new Date(leave.fromDate));
    const toYmd = dhakaYMD(new Date(leave.toDate));
    return fromYmd <= selectedYmd && selectedYmd <= toYmd;
  };

  // Hydration-safe initial date (client only)
  useEffect(() => {
    const todayYmd = dhakaYMD(new Date());
    setSelectedDate(todayYmd);
    const [y, m] = todayYmd.split("-").map(Number);
    if (Number.isFinite(y) && Number.isFinite(m)) {
      setSelectedYear(y);
      setSelectedMonth(m - 1);
    }
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
      setVisibleUsers(
        allUsers.filter((u: User) => u.email === session.user.email),
      );
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
  const {
    data: submissionData,
    error: submissionError,
    isLoading: submissionLoading,
  } = useSWR(
    reviewMode === "daily" && selectedDate && visibleUsers.length > 0
      ? [
          "submission-status",
          selectedDate,
          visibleUsers.map((u) => u.email).join(","),
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
            const data = await fetchCategoryData(
              `${ep.url}?emails=${encodeURIComponent(emails)}`,
            );
            return { key: ep.key, data };
          } catch {
            return { key: ep.key, data: {} };
          }
        }),
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
            const latest = records.reduce((acc: string | undefined, r: any) => {
              const ymd = dhakaYMD(new Date(r.date));
              return !acc || ymd > acc ? ymd : acc;
            }, lastSubmissionDate);
            lastSubmissionDate = latest;
          } else {
            categories[key] = false;
          }
        });

        const getMarkazName = (u: User): string => {
          if (!u.markaz) return "";
          return typeof u.markaz === "string" ? u.markaz : u.markaz.name || "";
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
    },
  );

  // Fetch approved leaves for the selected date
  const { data: leavesData } = useSWR(
    reviewMode === "daily" && selectedDate && visibleUsers.length > 0
      ? [
          "approved-leaves",
          selectedDate,
          visibleUsers.map((u) => u.email).join(","),
        ]
      : null,
    async () => {
      if (!selectedDate || visibleUsers.length === 0)
        return [] as LeaveRequest[];

      // Query by date window so backend only returns overlapping leaves
      const res = await fetch(
        `/api/leaves?status=approved&fromDate=${encodeURIComponent(selectedDate)}&toDate=${encodeURIComponent(selectedDate)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return [] as LeaveRequest[];
      const json = await res.json();
      const list = (json && (json.leaveRequests as LeaveRequest[])) || [];
      return Array.isArray(list) ? list : ([] as LeaveRequest[]);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    },
  );

  const { data: monthlyLeavesData } = useSWR(
    reviewMode === "monthly" && visibleUsers.length > 0
      ? [
          "approved-leaves-month",
          monthlyStartEnd.start,
          monthlyStartEnd.end,
          visibleUsers.map((u) => u.email).join(","),
        ]
      : null,
    async () => {
      const res = await fetch(
        `/api/leaves?status=approved&fromDate=${encodeURIComponent(
          monthlyStartEnd.start,
        )}&toDate=${encodeURIComponent(monthlyStartEnd.end)}`,
        { cache: "no-store" },
      );

      if (!res.ok) return [] as LeaveRequest[];

      const json = await res.json();
      const list = (json && (json.leaveRequests as LeaveRequest[])) || [];

      return Array.isArray(list) ? list : ([] as LeaveRequest[]);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    },
  );

  const leaveEmailSet = useMemo(() => {
    const set = new Set<string>();
    const list = (leavesData || []) as LeaveRequest[];
    list.forEach((lr) => {
      const email = (lr.user && lr.user.email) || lr.email;
      if (!email) return;
      if (lr.status !== "approved") return;
      if (!isOnLeaveForSelectedDate(lr, selectedDate)) return;
      set.add(email);
    });
    return set;
  }, [leavesData, selectedDate]);

  const monthlyUsersWithLeave = useMemo(() => {
    const users = ((monthlyUserData as any)?.users ||
      []) as MonthlyUserDayStatus[];
    const leaves = (monthlyLeavesData || []) as LeaveRequest[];

    if (users.length === 0) return [];

    return users.map((user) => {
      const copiedDays: MonthlyUserDayStatus["days"] = {};

      Object.entries(user.days).forEach(([day, value]) => {
        copiedDays[Number(day)] = {
          submitted: value.submitted,
          onLeave: false,
        };
      });

      leaves.forEach((leave) => {
        if (leave.status !== "approved") return;

        const email = leave.user?.email || leave.email;

        if (!email || email !== user.email) return;

        for (let day = 1; day <= monthlyStartEnd.daysInMonth; day++) {
          const ymd = `${selectedYear}-${String(selectedMonth + 1).padStart(
            2,
            "0",
          )}-${String(day).padStart(2, "0")}`;

          if (isOnLeaveForSelectedDate(leave, ymd)) {
            copiedDays[day].onLeave = true;
          }
        }
      });

      return {
        ...user,
        days: copiedDays,
      };
    });
  }, [
    monthlyLeavesData,
    monthlyStartEnd.daysInMonth,
    monthlyUserData,
    selectedMonth,
    selectedYear,
  ]);

  // Update submission status from SWR data
  const submissionStatus = useMemo(() => {
    const list = (submissionData || []) as DayeSubmissionStatus[];
    return list.map((s) => ({ ...s, onLeave: leaveEmailSet.has(s.email) }));
  }, [submissionData, leaveEmailSet]);
  const loading =
    (reviewMode === "daily" ? submissionLoading : monthlyLoading) ||
    !allUsers.length;

  // Filter and search
  const filteredStatus = useMemo(() => {
    if (reviewMode !== "daily") return [] as DayeSubmissionStatus[];
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
  }, [filterStatus, reviewMode, searchQuery, submissionStatus]);

  // Statistics
  const stats = useMemo(() => {
    if (reviewMode !== "daily") {
      const total = visibleUsers.length;
      return { total, submitted: 0, notSubmitted: 0, percentage: "0" };
    }
    const total = submissionStatus.length;
    const submitted = submissionStatus.filter(
      (s) => s.hasSubmittedToday,
    ).length;
    const notSubmitted = total - submitted;
    const percentage = total > 0 ? ((submitted / total) * 100).toFixed(1) : "0";

    return { total, submitted, notSubmitted, percentage };
  }, [reviewMode, submissionStatus, visibleUsers.length]);

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
      const row: Record<string, string> = {
        name: status.name,
      };

      columns.slice(1).forEach((col) => {
        if (status.onLeave) {
          row[col.key] = "LEAVE";
          return;
        }

        const isDone =
          status.categories[col.key as keyof typeof status.categories];
        row[col.key] = isDone ? "DONE" : "";
      });
      return row;
    });

    const exporterName = session?.user?.name || "Unknown";
    const exporterRole = session?.user?.role || "Unknown";

    const chunkSize = 23;
    const rowChunks: Array<typeof rows> = [];
    for (let i = 0; i < rows.length; i += chunkSize) {
      rowChunks.push(rows.slice(i, i + chunkSize));
    }

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

                .leave {
                  background-color: #fde68a;
                  color: #111827;
                  font-weight: 800;
                }

                .page {
                  page-break-after: always;
                }

                .page:last-child {
                  page-break-after: auto;
                }

                /* 🔹 force page break after every 28 rows */
                tbody tr:nth-child(28n) {
                  page-break-after: always;
                }
              </style>
            </head>

            <body>
              ${rowChunks
                .map(
                  (chunkRows) => `
                <div class="page">
                  <div class="header">
                    <h1>দা'ঈদের দৈনিক প্রতিবেদন</h1>
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
                      ${chunkRows
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
                                value === "DONE"
                                  ? "done"
                                  : value === "LEAVE"
                                    ? "leave"
                                    : "";

                              const displayValue =
                                value === "DONE"
                                  ? "সম্পন্ন"
                                  : value === "LEAVE"
                                    ? "ছুটিতে আছে"
                                    : "";

                              return `<td class="${cls}">${displayValue}</td>`;
                            })
                            .join("")}
                        </tr>
                      `,
                        )
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

  const exportMonthlyPDF = async () => {
    if (typeof window === "undefined") return;

    try {
      const y = selectedYear;
      const mLabel = monthOptions[selectedMonth] || String(selectedMonth + 1);
      const daysInMonth = monthlyStartEnd.daysInMonth;
      const users = monthlyUsersWithLeave;

      if (!users || users.length === 0) {
        toast.dismiss();
        toast.error("Monthly report data পাওয়া যায়নি।");
        return;
      }

      const exporterName = session?.user?.name || "Unknown";
      const exporterRole = session?.user?.role || "Unknown";
      const dayColumns = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const monthFormatted = `${mLabel} ${y}`;

      const chunkSize = 30;
      const rowChunks: Array<typeof users> = [];
      for (let i = 0; i < users.length; i += chunkSize) {
        rowChunks.push(users.slice(i, i + chunkSize));
      }

      const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: landscape;
              margin: 8mm;
            }

            body {
              font-family: Arial, "Noto Sans Bengali", sans-serif;
              padding: 4px;
              margin: 0;
              font-size: 9px;
              color: #111827;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .header {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              column-gap: 8px;
              align-items: end;
              margin-bottom: 6px;
            }

            h1 {
              grid-column: 1 / -1;
              text-align: center;
              color: #111827;
              font-size: 14px;
              font-weight: 800;
              margin: 0 0 2px 0;
            }

            h3 {
              color: #4b5563;
              font-size: 9px;
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
              font-size: 7.5px;
              border: 1px solid #cbd5e1;
              table-layout: fixed;
            }

            thead {
              display: table-header-group;
            }

            tr {
              height: 20px;
            }

            th, td {
              border: 1px solid #cbd5e1;
              padding: 2px 1px;
              text-align: center;
              vertical-align: middle;
              line-height: 1.1;
              white-space: nowrap;
              overflow: hidden;
            }

            th {
              background-color: #f3f4f6;
              font-weight: 800;
              font-size: 8px;
            }

            tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }

            td.name-cell {
              font-weight: 800;
              font-size: 8px;
              white-space: normal;
              text-align: center;
              width: 90px;
              min-width: 90px;
              max-width: 90px;
            }

            th.name-head {
              width: 90px;
              min-width: 90px;
              max-width: 90px;
            }

            th.day-head, td.day-cell {
              width: 22px;
              min-width: 22px;
              max-width: 22px;
              font-size: 7px;
              padding: 1px;
            }

            .done {
              background-color: #008080;
              color: #ffffff;
              font-weight: bold;
              font-size: 7px;
            }

            .leave {
              background-color: #fde68a;
              color: #111827;
              font-weight: 800;
              font-size: 6px;
            }

            .page {
              page-break-after: always;
            }

            .page:last-child {
              page-break-after: auto;
            }
          </style>
        </head>

        <body>
          ${rowChunks
            .map(
              (chunkRows) => `
            <div class="page">
              <div class="header">
                <h1>দা'ঈদের মাসিক প্রতিবেদন</h1>
                <h3>মাস: ${monthFormatted}</h3>
                <h3>প্রতিবেদন প্রস্তুতকারী: ${exporterName} (${exporterRole})</h3>
              </div>

              <table>
                <thead>
                  <tr>
                    <th class="name-head">ব্যবহারকারীর নাম</th>
                    ${dayColumns
                      .map((day) => `<th class="day-head">${day}</th>`)
                      .join("")}
                  </tr>
                </thead>
                <tbody>
                  ${chunkRows
                    .map(
                      (user) => `
                    <tr>
                      <td class="name-cell">${user.name || ""}</td>
                      ${dayColumns
                        .map((day) => {
                          const dayData = user.days[day];
                          const submitted = dayData?.submitted || 0;
                          const onLeave = dayData?.onLeave || false;

                          if (onLeave) {
                            return `<td class="day-cell leave">ছুটি</td>`;
                          }
                          if (submitted === 0) {
                            return `<td class="day-cell"></td>`;
                          }
                          return `<td class="day-cell done">${submitted}/9</td>`;
                        })
                        .join("")}
                    </tr>
                  `,
                    )
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

      const opt = {
        margin: 8,
        filename: `monthly-daye-report-${y}-${String(selectedMonth + 1).padStart(2, "0")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };

      const html2pdf = (await import("html2pdf.js")).default as any;
      html2pdf().set(opt).from(element).save();

      toast.dismiss();
      toast.success("Monthly PDF সফলভাবে ডাউনলোড হয়েছে!");
    } catch (error) {
      console.error("Monthly PDF generation error:", error);
      toast.dismiss();
      toast.error("Monthly PDF তৈরি করতে ব্যর্থ হয়েছে।");
    }
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={reviewMode === "daily" ? "default" : "outline"}
              onClick={() => setReviewMode("daily")}
              className={reviewMode === "daily" ? "text-white" : ""}
            >
              Daily
            </Button>
            <Button
              size="sm"
              variant={reviewMode === "monthly" ? "default" : "outline"}
              onClick={() => setReviewMode("monthly")}
              className={reviewMode === "monthly" ? "text-white" : ""}
            >
              Monthly
            </Button>

            {reviewMode === "daily" ? (
              <>
                <Calendar className="h-5 w-5 text-gray-500" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </>
            ) : (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {monthOptions.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {Array.from(
                    { length: 6 },
                    (_, i) => new Date().getFullYear() - 2 + i,
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </>
            )}
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
          {reviewMode === "daily" ? (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("filters.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex gap-2">
            {reviewMode === "daily" ? (
              <>
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
                  variant={
                    filterStatus === "not-submitted" ? "default" : "outline"
                  }
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
              </>
            ) : null}
            {reviewMode === "daily" ? (
              <Button
                onClick={exportToPDF}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white hover:text-white"
              >
                <Download className="h-4 w-4" />
                Daily PDF
              </Button>
            ) : (
              <Button
                onClick={exportMonthlyPDF}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white hover:text-white"
              >
                <Download className="h-4 w-4" />
                Monthly PDF
              </Button>
            )}
          </div>
        </div>

        {reviewMode === "monthly" ? (
          <div className="grid grid-cols-1 gap-4">
            {monthlyUsersWithLeave.map((user) => (
              <Card
                key={user.email}
                className="border-green-200 bg-green-50/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{user.name}</CardTitle>

                      <p className="text-sm text-muted-foreground mt-1">
                        {user.email}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {user.location || t("list.locationUnknown")}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm font-medium mb-2">
                    মাসিক দিনের রিপোর্ট:
                  </p>

                  <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {Array.from(
                      { length: monthlyStartEnd.daysInMonth },
                      (_, index) => index + 1,
                    ).map((day) => {
                      const dayData = user.days[day];
                      const submitted = dayData?.submitted || 0;
                      const onLeave = dayData?.onLeave || false;

                      return (
                        <Badge
                          key={day}
                          variant="outline"
                          className={`text-xs justify-between ${
                            onLeave
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : submitted > 0
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-gray-100 text-gray-500 border-gray-300"
                          }`}
                        >
                          <span>Day {day}</span>
                          <span className="font-bold">
                            {onLeave
                              ? "ছুটি"
                              : submitted > 0
                                ? `${submitted}/9`
                                : ""}
                          </span>
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {monthlyUsersWithLeave.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">কোনো তথ্য পাওয়া যায়নি</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <>
            {/* Daye List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredStatus.map((status) => (
                <Card
                  key={status.email}
                  className={`transition-all ${
                    status.onLeave
                      ? "border-amber-200 bg-amber-50/30"
                      : status.hasSubmittedToday
                        ? "border-green-200 bg-green-50/30"
                        : "border-red-200 bg-red-50/30"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {status.name}
                          {status.onLeave ? null : status.hasSubmittedToday ? (
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
                        variant={
                          status.onLeave
                            ? "outline"
                            : status.hasSubmittedToday
                              ? "default"
                              : "destructive"
                        }
                        className={
                          status.onLeave
                            ? "bg-amber-200 text-amber-900 border-amber-300"
                            : status.hasSubmittedToday
                              ? "bg-green-600"
                              : "bg-red-600"
                        }
                      >
                        {status.onLeave
                          ? "ছুটিতে"
                          : status.hasSubmittedToday
                            ? t("badge.completed")
                            : t("badge.incomplete")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">
                          {t("details.todaySummary")} ({status.totalSubmissions}
                          /9):
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
                            {
                              key: "dinefera",
                              label: t("categories.dinefera"),
                            },
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
                          {new Date(
                            status.lastSubmissionDate,
                          ).toLocaleDateString()}
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
                  <p className="text-muted-foreground">
                    {t("empty.noResults")}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </SWRConfig>
  );
};

export default DayeReviewComponent;
