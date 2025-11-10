"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
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

const DayeReviewComponent: React.FC = () => {
  const [dayees, setDayees] = useState<User[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<
    DayeSubmissionStatus[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
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

  // Fetch all users (not only dayees)
  useEffect(() => {
    const fetchDayees = async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        const users = Array.isArray(data) ? data : data.users || [];
        // Show ALL users in review, not just role === "daye"
        setDayees(users);
      } catch (error) {
        console.error("Error fetching dayees:", error);
        toast.error("দা'ঈদের তথ্য লোড করতে ব্যর্থ");
      }
    };
    fetchDayees();
  }, []);

  // Fetch submission status for all users in list
  useEffect(() => {
    const fetchSubmissionStatus = async () => {
      if (dayees.length === 0) return;

      setLoading(true);
      try {
        const emails = dayees.map((d) => d.email).join(",");

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
              const res = await fetch(
                `${ep.url}?emails=${encodeURIComponent(emails)}`,
                { cache: "no-store" }
              );
              if (!res.ok) return { key: ep.key, data: {} };
              const json = await res.json();
              // robust: some endpoints return { records: { [email]: [] | {records: []} } }
              const data = (json && json.records) || {};
              return { key: ep.key, data };
            } catch {
              return { key: ep.key, data: {} };
            }
          })
        );

        // Process submission status
        const statusList: DayeSubmissionStatus[] = dayees.map((daye) => {
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

        setSubmissionStatus(statusList);
      } catch (error) {
        console.error("Error fetching submission status:", error);
        toast.error("সাবমিশন স্ট্যাটাস লোড করতে ব্যর্থ");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionStatus();
  }, [dayees, selectedDate]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            দা'ঈ রিভিউ ড্যাশবোর্ড
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            আজকের কাজের অগ্রগতি পর্যালোচনা করুন
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
            <CardTitle className="text-sm font-medium">মোট দা'ঈ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              কাজ জমা দিয়েছে
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {stats.submitted}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {stats.percentage}% সম্পন্ন
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              কাজ জমা দেয়নি
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {stats.notSubmitted}
            </div>
            <p className="text-xs text-red-600 mt-1">
              {(100 - parseFloat(stats.percentage)).toFixed(1)}% বাকি
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অগ্রগতি</CardTitle>
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
              সম্পূর্ণতা: {stats.percentage}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="নাম, ইমেইল বা স্থান দিয়ে খুঁজুন..."
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
          >
            সব ({submissionStatus.length})
          </Button>
          <Button
            variant={filterStatus === "submitted" ? "default" : "outline"}
            onClick={() => setFilterStatus("submitted")}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            জমা দিয়েছে ({stats.submitted})
          </Button>
          <Button
            variant={filterStatus === "not-submitted" ? "default" : "outline"}
            onClick={() => setFilterStatus("not-submitted")}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            জমা দেয়নি ({stats.notSubmitted})
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
                    📍 {status.location || "স্থান উল্লেখ নেই"}
                  </p>
                </div>
                <Badge
                  variant={status.hasSubmittedToday ? "default" : "destructive"}
                  className={
                    status.hasSubmittedToday ? "bg-green-600" : "bg-red-600"
                  }
                >
                  {status.hasSubmittedToday ? "সম্পন্ন" : "অসম্পূর্ণ"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">
                    আজকের কাজের বিবরণ ({status.totalSubmissions}/9):
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "amoli", label: "আ'মলি" },
                      { key: "moktob", label: "মক্তব" },
                      { key: "talim", label: "তালিম" },
                      { key: "daye", label: "দা'ঈ" },
                      { key: "dawati", label: "দাওয়াতি" },
                      { key: "dawatimojlish", label: "মজলিশ" },
                      { key: "jamat", label: "জামাত" },
                      { key: "dinefera", label: "দ্বীনে ফেরা" },
                      { key: "sofor", label: "সফর" },
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
                    শেষ সাবমিশন:{" "}
                    {new Date(status.lastSubmissionDate).toLocaleDateString(
                      "bn-BD"
                    )}
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
            <p className="text-muted-foreground">কোনো দা'ঈ পাওয়া যায়নি</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DayeReviewComponent;
