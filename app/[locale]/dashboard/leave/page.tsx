"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LeaveRequestForm } from "@/components/dashboard/leaves/leave-request-form";
import { UserLeaveTable } from "@/components/dashboard/leaves/user-leave-table";
import LeaveStatsBar from "@/components/dashboard/leaves/leave-stats";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
  // optional fields from your API (not used in stats, but safe to include)
  userId?: string;
  phone?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function LeavesPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // stats-specific state (independent from the table)
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<LeaveRequest[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const t = useTranslations("leaveTable.page");

  const refetchLeaveRequests = useCallback(() => {
    // Refresh the table
    setRefetchTrigger((prev) => prev + 1);
    // Refresh the stats
    fetchStats();
  }, []);

  const fetchStats = useCallback(async () => {
    if (!userEmail) return;
    setStatsLoading(true);
    setStatsError(null);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch(
        `/api/leaves?email=${encodeURIComponent(userEmail)}`,
        {
          signal: ac.signal,
          cache: "no-store",
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || t("errors.fetchFailed"));
      const arr = Array.isArray(data?.leaveRequests) ? data.leaveRequests : [];
      setStatsData(arr);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      const msg = err?.message || t("errors.unknown");
      setStatsError(msg);
      toast.error(`${t("errors.toastPrefix")} ${msg}`);
    } finally {
      setStatsLoading(false);
    }
  }, [userEmail, t]);

  useEffect(() => {
    fetchStats();
    return () => abortRef.current?.abort();
  }, [fetchStats, refetchTrigger]);

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-4 md:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("loadingSession")}</p>
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-4 md:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("loginPrompt")}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center sm:p-2 md:p-4 space-y-6 dark:from-gray-950 dark:to-gray-900 min-h-screen w-full">
      {/* Header actions */}
      <div className="w-full flex justify-end">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sky-600 hover:bg-sky-800 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              <PlusIcon className="mr-2 h-5 w-5" />
              {t("openForm")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-lg shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-sky-600 to-cyan-700 text-white p-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold">
                {t("dialog.title")}
              </DialogTitle>
              <DialogDescription className="text-purple-100">
                {t("dialog.description")}
              </DialogDescription>
            </DialogHeader>
            <LeaveRequestForm
              userEmail={userEmail}
              onSubmissionSuccess={refetchLeaveRequests}
              onClose={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats bar (uses a lightweight fetch on the page) */}
      {!statsLoading && !statsError && (
        <LeaveStatsBar leaveRequests={statsData} />
      )}

      {/* Optionally show a small loader / message while stats load or error */}
      {statsLoading && (
        <div className="w-full flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
        </div>
      )}
      {statsError && (
        <div className="w-full text-center py-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
          {t("errors.shortPrefix")} {statsError}
        </div>
      )}

      {/* The detailed table (keeps its own fetch + refetch trigger) */}
      <UserLeaveTable userEmail={userEmail} refetch={refetchTrigger} />
    </main>
  );
}
