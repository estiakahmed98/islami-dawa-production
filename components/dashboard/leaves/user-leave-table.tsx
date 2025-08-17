"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  CalendarDays, CheckCircle2, Clock, XCircle, Eye, X as CloseIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface LeaveRequest {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: string; // "pending" | "approved" | "rejected"
  requestDate: string;
  approvedBy?: string | null;
  rejectionReason?: string | null;
}

interface UserLeaveTableProps {
  userEmail: string;
  /** bump this number to trigger refetch from parent */
  refetch: number;
}

/** English -> Bangla digits */
const toBn = (val: string | number) =>
  String(val).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/** Format date to Bangla (bn-BD) locale */
const formatBD = (dateStr: string) =>
  new Intl.DateTimeFormat("bn-BD", { year: "numeric", month: "short", day: "numeric" })
    .format(new Date(dateStr));

export function UserLeaveTable({ userEmail, refetch }: UserLeaveTableProps) {
  const t = useTranslations("leaveTable");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<{ open: boolean; text: string }>({
    open: false,
    text: "",
  });

  const abortRef = useRef<AbortController | null>(null);

  const statusInfo = useCallback(
    (statusRaw: string) => {
      const s = (statusRaw || "").toLowerCase();
      if (s === "approved")
        return {
          text: t("status.approved"),
          pill: "bg-emerald-100 text-emerald-800 border-emerald-200",
          row: "bg-emerald-50 hover:bg-emerald-100 border-l-4 border-l-emerald-400",
          icon: <CheckCircle2 className="h-4 w-4" />,
        };
      if (s === "rejected")
        return {
          text: t("status.rejected"),
          pill: "bg-red-100 text-red-800 border-red-200",
          row: "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400",
          icon: <XCircle className="h-4 w-4" />,
        };
      return {
        text: t("status.pending"),
        pill: "bg-amber-100 text-amber-800 border-amber-200",
        row: "bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-400",
        icon: <Clock className="h-4 w-4" />,
      };
    },
    [t]
  );

  const leaveTypeLabel = useCallback(
    (typeRaw: string) => {
      const k = (typeRaw || "").toLowerCase();
      // keys: casual, sick, maternity, paternity, annual, other
      return t(`types.${["casual","sick","maternity","paternity","annual","other"].includes(k) ? k : "other"}`);
    },
    [t]
  );

  const fetchLeaveRequests = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch(`/api/leaves?email=${encodeURIComponent(userEmail)}`, {
        signal: ac.signal,
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || t("errors.fetchFailed"));
      setLeaveRequests(Array.isArray(data.leaveRequests) ? data.leaveRequests : []);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      const msg = err?.message || t("errors.unknown");
      setError(msg);
      toast.error(`${t("errors.toastPrefix")} ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [userEmail, t]);

  useEffect(() => {
    fetchLeaveRequests();
    return () => abortRef.current?.abort();
  }, [fetchLeaveRequests, refetch]);

  const summary = useMemo(() => {
    const a = leaveRequests.filter((r) => r.status?.toLowerCase() === "approved").length;
    const p = leaveRequests.filter((r) => r.status?.toLowerCase() === "pending").length;
    const r = leaveRequests.filter((r) => r.status?.toLowerCase() === "rejected").length;
    return { approved: a, pending: p, rejected: r };
  }, [leaveRequests]);

  // Loading state
  if (loading) {
    return (
      <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-white border-b p-6 shadow-sm">
          <CardTitle className="text-xl font-bold text-gray-800">{t("title")}</CardTitle>
          <CardDescription className="text-gray-500 mt-1">{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4 py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600" />
            <p className="text-muted-foreground text-base">{t("loading")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-white border-b p-6 shadow-sm">
          <CardTitle className="text-xl font-bold text-gray-800">{t("title")}</CardTitle>
          <CardDescription className="text-gray-500 mt-1">{t("errorSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center">
            <p className="text-rose-700 text-base">
              <span className="font-semibold">{t("errorPrefix")}</span> {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full mx-auto shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-white border-b p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">{t("title")}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">{t("subtitleNow")}</CardDescription>
            </div>
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {t("status.approved")}:
                <span className="font-semibold">{toBn(summary.approved)}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 text-amber-700 px-3 py-1.5">
                <Clock className="h-4 w-4" />
                {t("status.pending")}:
                <span className="font-semibold">{toBn(summary.pending)}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 text-red-700 px-3 py-1.5">
                <XCircle className="h-4 w-4" />
                {t("status.rejected")}:
                <span className="font-semibold">{toBn(summary.rejected)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {leaveRequests.length === 0 ? (
            <div className="text-center py-14 px-6">
              <div className="bg-muted/40 rounded-xl p-10 border-2 border-dashed border-border">
                <CalendarDays className="h-10 w-10 mx-auto opacity-60" />
                <p className="mt-4 text-lg text-muted-foreground">{t("empty.title")}</p>
                <p className="text-sm text-muted-foreground/80">{t("empty.subtitle")}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white border-b">
                      <TableHead className="font-semibold text-white py-4 px-6">{t("table.leaveType")}</TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">{t("table.from")}</TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">{t("table.to")}</TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">{t("table.days")}</TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">{t("table.reason")}</TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">{t("table.status")}</TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">{t("table.requestDate")}</TableHead>
                      <TableHead className="font-semibold text-white py-4 px-6">{t("table.approvedBy")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((req) => {
                      const s = statusInfo(req.status);
                      return (
                        <TableRow key={req.id} className={`transition-all duration-200 ${s.row}`}>
                          <TableCell className="py-4 px-6 font-medium">
                            {leaveTypeLabel(req.leaveType)}
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
                            <div className="truncate" title={req.reason}>{req.reason}</div>
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

                              {/* Show reason button only when rejected */}
                              {req.status?.toLowerCase() === "rejected" && (
                                <button
                                  type="button"
                                  title={t("actions.viewRejection")}
                                  aria-label={t("actions.viewRejection")}
                                  onClick={() =>
                                    setReasonModal({
                                      open: true,
                                      text: (req.rejectionReason ?? "").trim() || t("noRejectionReason"),
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
                              <span className="font-medium">{req.approvedBy}</span>
                            ) : (
                              <span className="text-muted-foreground italic">—</span>
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

      {/* Rejection reason modal */}
      {reasonModal.open && (
        <div className="fixed inset-0 w-[80vw] h-[80vh] z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">{t("rejectionModal.title")}</h2>
              <button
                type="button"
                aria-label={t("actions.close")}
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
                {t("actions.ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
