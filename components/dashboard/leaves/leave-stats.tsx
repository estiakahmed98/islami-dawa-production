"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  CalendarDays,
  Plane,
  BarChart3,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

type LeaveStatus = "pending" | "approved" | "rejected";

interface LeaveRequest {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus | string;
  requestDate: string;
  approvedBy?: string | null;
  rejectionReason?: string | null;
}

interface LeaveStatsProps {
  /** full list for the signed-in user */
  leaveRequests: LeaveRequest[];
}

/** English -> Bangla digits */
const toBn = (val: string | number) =>
  String(val).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/** Format date to Bangla (bn-BD) locale */
const formatBD = (dateStr: string) =>
  new Intl.DateTimeFormat("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));

export function LeaveStatsBar({ leaveRequests }: LeaveStatsProps) {
  const t = useTranslations("leaveTable.stats");

  const stats = useMemo(() => {
    const now = new Date();

    const normalize = (s?: string) => (s ?? "").toLowerCase() as LeaveStatus;
    const byStatus = {
      approved: leaveRequests.filter((r) => normalize(r.status) === "approved"),
      pending: leaveRequests.filter((r) => normalize(r.status) === "pending"),
      rejected: leaveRequests.filter((r) => normalize(r.status) === "rejected"),
    };

    const total = leaveRequests.length;
    const approvedCount = byStatus.approved.length;
    const pendingCount = byStatus.pending.length;
    const rejectedCount = byStatus.rejected.length;

    const totalDays = leaveRequests.reduce(
      (sum, r) => sum + (Number(r.days) || 0),
      0
    );
    const approvedDays = byStatus.approved.reduce(
      (sum, r) => sum + (Number(r.days) || 0),
      0
    );

    // Approved days per leave type (useful for remaining calculations)
    const approvedDaysByType = byStatus.approved.reduce<Record<string, number>>(
      (acc, r) => {
        const k = (r.leaveType || "other").toLowerCase();
        acc[k] = (acc[k] ?? 0) + (Number(r.days) || 0);
        return acc;
      },
      {}
    );

    // Company / policy allowances (adjust as needed)
    const allowances: Record<string, number> = {
      casual: 7,
      sick: 10,
    };

    // Remaining per type = allowance - already approved days of that type
    const remainingCasual = Math.max(
      (allowances.casual ?? 0) - (approvedDaysByType.casual ?? 0),
      0
    );
    const remainingSick = Math.max(
      (allowances.sick ?? 0) - (approvedDaysByType.sick ?? 0),
      0
    );

    // Combined remaining days across allowances minus approvedDays
    const totalAllowance = Object.values(allowances).reduce((s, v) => s + v, 0);
    const remainingTotal = Math.max(totalAllowance - approvedDays, 0);

    // Next upcoming approved leave start date
    const upcoming = byStatus.approved
      .map((r) => new Date(r.fromDate))
      .filter((d) => d >= new Date(now.toDateString())) // today or future
      .sort((a, b) => a.getTime() - b.getTime())[0];

    // Most common leave type (by occurrences)
    const typeCounts = leaveRequests.reduce<Record<string, number>>(
      (acc, r) => {
        const k = (r.leaveType || "other").toLowerCase();
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      },
      {}
    );
    let commonType: string | null = null;
    let maxCnt = -1;
    for (const [k, v] of Object.entries(typeCounts)) {
      if (v > maxCnt) {
        maxCnt = v;
        commonType = k;
      }
    }

    const rejectionRate = total ? Math.round((rejectedCount * 100) / total) : 0;

    return {
      total,
      totalDays,
      approvedCount,
      approvedDays,
      approvedDaysByType,
      allowances,
      remainingCasual,
      remainingSick,
      totalAllowance,
      remainingTotal,
      pendingCount,
      rejectedCount,
      rejectionRate,
      upcomingDate: upcoming || null,
      commonType: commonType || "other",
    };
  }, [leaveRequests]);

  // small helper to localize type labels via your existing keys
  const typeLabel = (k: string) => {
    const key = [
      "casual",
      "sick",
      "maternity",
      "paternity",
      "other",
    ].includes(k)
      ? k
      : "other";
    return t(`types.${key}`);
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{t("title")}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Leave Allowances */}
        <Card className="p-5 shadow-md border-cyan-100 bg-gradient-to-br from-cyan-50 to-white">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-md bg-cyan-100 mr-3">
              <Calendar className="h-5 w-5 text-cyan-600" />
            </div>
            <h3 className="font-medium text-gray-700">{t("allowances")}</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t("types.casual")}:</span>
              <div>
                <span className="text-sm text-gray-500 mr-1">{t("total")} {toBn(stats.allowances.casual)}</span>
                <span className="font-medium text-cyan-700">{t("remaining")} {toBn(stats.remainingCasual)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t("types.sick")}:</span>
              <div>
                <span className="text-sm text-gray-500 mr-1">{t("total")} {toBn(stats.allowances.sick)}</span>
                <span className="font-medium text-cyan-700">{t("remaining")} {toBn(stats.remainingSick)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
            <span className="text-sm text-gray-600">{t("totalremaining")}:</span>
            <span className="font-semibold text-cyan-800">{toBn(stats.remainingTotal)} {t("day")}</span>
          </div>
        </Card>

        {/* Card 2: Popular Leave Type */}
        <Card className="p-5 shadow-md border-violet-100 bg-gradient-to-br from-violet-50 to-white">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-md bg-violet-100 mr-3">
              <BarChart3 className="h-5 w-5 text-violet-600" />
            </div>
            <h3 className="font-medium text-gray-700">{t("popularType")}</h3>
          </div>
          
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-violet-100 mb-2">
                <Plane className="h-6 w-6 text-violet-600" />
              </div>
              <p className="mt-1 text-lg font-semibold text-violet-800">
                {typeLabel(stats.commonType)}
              </p>
            </div>
          </div>
          
          <p className="mt-3 text-xs text-center text-gray-500 bg-violet-50 p-2 rounded-md">
            {t("hint")}
          </p>
        </Card>

        {/* Card 3: Request Statistics */}
        <Card className="p-5 shadow-md border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-md bg-emerald-100 mr-3">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-medium text-gray-700">{t("totalRequests")}</h3>
          </div>
          
          <div className="text-center py-2">
            <p className="text-3xl font-bold text-emerald-800">{toBn(stats.total)}</p>
            <p className="text-sm text-gray-500 mt-1">{t("totalappilied")}</p>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-1">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {t("approvedShort")}
              </Badge>
              <span className="font-medium text-emerald-800">{toBn(stats.approvedCount)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 px-2 py-1">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {t("pendingShort")}
              </Badge>
              <span className="font-medium text-amber-800">{toBn(stats.pendingCount)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 px-2 py-1">
                <XCircle className="h-3.5 w-3.5 mr-1" />
                {t("rejectedShort")}
              </Badge>
              <span className="font-medium text-red-800">{toBn(stats.rejectedCount)}</span>
            </div>
          </div>
        </Card>

        {/* Card 4: Days Summary */}
        <Card className="p-5 shadow-md border-sky-100 bg-gradient-to-br from-sky-50 to-white">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-md bg-sky-100 mr-3">
              <CalendarDays className="h-5 w-5 text-sky-600" />
            </div>
            <h3 className="font-medium text-gray-700">{t("daysSummary")}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-sky-800">{toBn(stats.totalDays)}</p>
              <p className="text-sm text-gray-600">{t("daysRequested")}</p>
            </div>
            
            <div className="text-center">
              <p className="text-xl font-semibold text-emerald-700">{toBn(stats.approvedDays)}</p>
              <p className="text-sm text-gray-600">{t("daysApproved")}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LeaveStatsBar;