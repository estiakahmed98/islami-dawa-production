"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X as CloseIcon,
} from "lucide-react";

interface LeaveRequest {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: string;
  requestDate: string;
  approvedBy?: string | null;
  rejectionReason?: string | null;
}

interface UserLeaveTableProps {
  userEmail: string;
  refetch: number; // trigger refetch when it changes
}

/** English -> Bangla digits */
const toBn = (val: string | number) =>
  String(val).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/** Format date to Bangla locale */
const formatBD = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/** Translate leave type for display */
const leaveTypeBn: Record<string, string> = {
  casual: "ক্যাজুয়াল",
  sick: "অসুস্থতা",
  maternity: "মাতৃত্বকালীন",
  paternity: "পিতৃত্বকালীন",
  annual: "বাৎসরিক",
  other: "অন্যান্য",
};

const statusInfo = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved")
    return {
      text: "অনুমোদিত",
      pill: "bg-emerald-100 text-emerald-800 border-emerald-200",
      row: "bg-emerald-50 hover:bg-emerald-100 border-l-4 border-l-emerald-400",
      icon: <CheckCircle2 className="h-4 w-4" />,
    };
  if (s === "rejected")
    return {
      text: "প্রত্যাখ্যাত",
      pill: "bg-red-100 text-red-800 border-red-200",
      row: "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400",
      icon: <XCircle className="h-4 w-4" />,
    };
  // pending/default
  return {
    text: "অপেক্ষমাণ",
    pill: "bg-amber-100 text-amber-800 border-amber-200",
    row: "bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-400",
    icon: <Clock className="h-4 w-4" />,
  };
};

export function UserLeaveTable({ userEmail, refetch }: UserLeaveTableProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<{
    open: boolean;
    text: string;
  }>({
    open: false,
    text: "",
  });

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/leaves?email=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "ছুটির তালিকা পাওয়া যায়নি।");
      }
      setLeaveRequests(data.leaveRequests ?? []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`ডাটা লোড করতে সমস্যা: ${err?.message || "অজানা ত্রুটি"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) fetchLeaveRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, refetch]);

  const summary = useMemo(() => {
    const a = leaveRequests.filter(
      (r) => r.status.toLowerCase() === "approved"
    ).length;
    const p = leaveRequests.filter(
      (r) => r.status.toLowerCase() === "pending"
    ).length;
    const r = leaveRequests.filter(
      (r) => r.status.toLowerCase() === "rejected"
    ).length;
    return { approved: a, pending: p, rejected: r };
  }, [leaveRequests]);

  if (loading) {
    return (
      <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-white border-b p-6 shadow-sm">
          <CardTitle className="text-xl font-bold text-gray-800">
            আপনার ছুটির আবেদনসমূহ
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            জমাকৃত আবেদনের অবস্থা এক নজরে দেখুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4 py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600" />
            <p className="text-muted-foreground text-base">ডাটা লোড হচ্ছে…</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-white border-b p-6 shadow-sm">
          <CardTitle className="text-xl font-bold text-gray-800">
            আপনার ছুটির আবেদনসমূহ
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            ডাটা লোড করতে সমস্যা হয়েছে।
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center">
            <p className="text-rose-700 text-base">
              <span className="font-semibold">ত্রুটি:</span> {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
        {/* DISTINCT CARD HEADER */}
        <CardHeader className="bg-white border-b p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                আপনার ছুটির আবেদনসমূহ
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                জমাকৃত আবেদন ও বর্তমান স্ট্যাটাস
              </CardDescription>
            </div>
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1.5">
                <CheckCircle2 className="h-4 w-4" />
                অনুমোদিত:{" "}
                <span className="font-semibold">{toBn(summary.approved)}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 text-amber-700 px-3 py-1.5">
                <Clock className="h-4 w-4" />
                অপেক্ষমাণ:{" "}
                <span className="font-semibold">{toBn(summary.pending)}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 text-red-700 px-3 py-1.5">
                <XCircle className="h-4 w-4" />
                প্রত্যাখ্যাত:{" "}
                <span className="font-semibold">{toBn(summary.rejected)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* TABLE AREA - visually different */}
        <CardContent className="p-0">
          {leaveRequests.length === 0 ? (
            <div className="text-center py-14 px-6">
              <div className="bg-muted/40 rounded-xl p-10 border-2 border-dashed border-border">
                <CalendarDays className="h-10 w-10 mx-auto opacity-60" />
                <p className="mt-4 text-lg text-muted-foreground">
                  কোনো ছুটির আবেদন পাওয়া যায়নি
                </p>
                <p className="text-sm text-muted-foreground/80">
                  আপনি যে আবেদন করবেন, সেটি এখানে দেখাবে।
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white border-b">
                      <TableHead className="font-semibold text-white py-4 px-6">
                        ছুটির ধরন
                      </TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">
                        শুরুর তারিখ
                      </TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">
                        শেষ তারিখ
                      </TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">
                        দিন
                      </TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">
                        কারণ
                      </TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">
                        অবস্থা
                      </TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">
                        আবেদনের তারিখ
                      </TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">
                        যিনি অনুমোদন করেছেন
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((req) => {
                      const s = statusInfo(req.status);
                      return (
                        <TableRow
                          key={req.id}
                          className={`transition-all duration-200 ${s.row}`}
                        >
                          <TableCell className="py-4 px-6 font-medium">
                            {leaveTypeBn[req.leaveType?.toLowerCase()] ||
                              "অন্যান্য"}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-muted-foreground">
                            {formatBD(req.fromDate)}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-muted-foreground">
                            {formatBD(req.toDate)}
                          </TableCell>
                          <TableCell className="py-4 px-6 font-semibold">
                            {toBn(req.days)}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-muted-foreground max-w-[320px]">
                            <div className="truncate" title={req.reason}>
                              {req.reason}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="inline-flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${s.pill}`}
                                title={s.text}
                              >
                                {s.icon}
                                {s.text}
                              </span>

                              {/* 👇 Show eye button only when rejected */}
                              {req.status.toLowerCase() === "rejected" && (
                                <button
                                  type="button"
                                  title="প্রত্যাখ্যানের কারণ দেখুন"
                                  aria-label="View rejection reason"
                                  onClick={() =>
                                    setReasonModal({
                                      open: true,
                                      text:
                                        req.rejectionReason?.trim() ||
                                        "কোনো কারণ সংরক্ষিত নেই",
                                    })
                                  }
                                  className="p-1.5 rounded-md text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="py-4 px-6 text-muted-foreground">
                            {formatBD(req.requestDate)}
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            {req.approvedBy ? (
                              <span className="font-medium">
                                {req.approvedBy}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">
                                —
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {reasonModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">
                প্রত্যাখ্যানের কারণ
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setReasonModal({ open: false, text: "" })}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 py-4">
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {reasonModal.text}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <button
                type="button"
                onClick={() => setReasonModal({ open: false, text: "" })}
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
