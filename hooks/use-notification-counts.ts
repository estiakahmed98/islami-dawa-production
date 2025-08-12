"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";

const ADMIN_ROLES = [
  "centraladmin",
  "superadmin",
  "divisionadmin",
  "districtadmin",
  "areaadmin",
  "upozilaadmin",
  "unionadmin",
];

export function useNotificationCounts(pollMs = 30_000) {
  const { data: session } = useSession();
  const role = session?.user?.role || "user";
  const isAdmin = useMemo(() => ADMIN_ROLES.includes(role), [role]);

  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingEditCount, setPendingEditCount] = useState(0);

  const fetchPendingLeaveCount = async () => {
    try {
      const res = await fetch("/api/leaves?status=pending");
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      setPendingLeaveCount(Array.isArray(data?.leaveRequests) ? data.leaveRequests.length : 0);
    } catch {
      setPendingLeaveCount(0);
    }
  };

  const fetchPendingEditCount = async () => {
    try {
      // Try filtered endpoint first
      let res = await fetch("/api/edit-requests?status=pending");
      if (res.ok) {
        const data = await res.json();
        const list = data?.requests || data?.editRequests || data || [];
        setPendingEditCount(Array.isArray(list) ? list.length : 0);
        return;
      }
      // Fallback: fetch all and filter client-side
      res = await fetch("/api/edit-requests");
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      const list = data?.requests || data?.editRequests || [];
      const pending = Array.isArray(list) ? list.filter((r: any) => (r.status || "").toLowerCase() === "pending") : [];
      setPendingEditCount(pending.length);
    } catch {
      setPendingEditCount(0);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    // initial
    fetchPendingLeaveCount();
    fetchPendingEditCount();

    const id = setInterval(() => {
      fetchPendingLeaveCount();
      fetchPendingEditCount();
    }, pollMs);

    return () => clearInterval(id);
  }, [isAdmin, pollMs]);

  return { isAdmin, pendingLeaveCount, pendingEditCount };
}
