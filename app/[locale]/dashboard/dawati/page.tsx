"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
import UniversalTableShow from "@/components/TableShow";
import DawatiForm from "@/components/DawatiForm";
import Loading from "@/app/[locale]/dashboard/loading";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type RecordRow = {
  nonMuslimDawat?: number;
  murtadDawat?: number;
  nonMuslimSaptahikGasht?: number;
  editorContent?: string | null;
};

// YYYY-MM-DD in Asia/Dhaka
function dhakaYMD(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

const DawatiPage: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const tCommon = useTranslations("common");
  const tDawati = useTranslations("dashboard.UserDashboard.dawati");
  const tToast = useTranslations("dashboard.UserDashboard.toast");

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>({ records: {}, labelMap: {} });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const labelMap = useMemo(
    () => ({
      nonMuslimDawat: tDawati("nonMuslimDawat"),
      murtadDawat: tDawati("murtadDawat"),
      nonMuslimSaptahikGasht: tDawati("nonMuslimSaptahikGasht"),
    }),
    [tDawati]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/dawati?email=${encodeURIComponent(userEmail)}&sort=asc`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();

        const records = (json?.records ?? []) as Array<{
          date: string | Date;
          nonMuslimDawat?: number;
          murtadDawat?: number;
          nonMuslimSaptahikGasht?: number;
          editorContent?: string | null;
        }>;

        const shaped = records.reduce<Record<string, RecordRow>>((acc, rec) => {
          const dateStr = dhakaYMD(new Date(rec.date));
          acc[dateStr] = {
            nonMuslimDawat: rec.nonMuslimDawat ?? 0,
            murtadDawat: rec.murtadDawat ?? 0,
            nonMuslimSaptahikGasht: rec.nonMuslimSaptahikGasht ?? 0,
            editorContent: rec.editorContent ?? "",
          };
          return acc;
        }, {});

        setUserData({ records: { [userEmail]: shaped }, labelMap });
      } catch (e) {
        console.error("Failed to fetch Dawati records:", e);
        toast.error(tToast("errorFetchingData"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail, labelMap, tToast]);

  return (
    <div>
      {loading ? (
        // Page Skeleton Loader
        <div className="w-full p-2 lg:p-4">
          {/* Tab List Skeleton */}
          <div className="flex justify-between mb-6">
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>

          {/* Tab Content Skeleton */}
          <div className="bg-gray-50 lg:rounded lg:shadow p-6">
            {/* Form Skeleton */}
            <div className="space-y-6">
              {/* Alert Skeleton */}
              <div className="h-12 bg-gray-100 rounded-lg mb-8 animate-pulse"></div>

              {/* Title Skeleton */}
              <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

              {/* Form Grid Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Form Field Skeletons */}
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    {/* Label Skeleton */}
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                    
                    {/* Input Field Skeleton */}
                    <div className="h-10 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
                    
                    {/* Error Message Skeleton */}
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Editor Skeleton */}
              <div className="mt-4">
                {/* Editor Label Skeleton */}
                <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                
                {/* Editor Content Skeleton */}
                <div className="h-72 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>

              {/* Submit Button Skeleton */}
              <div className="flex justify-end mt-4">
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="dataForm">{tCommon("dataForm")}</TabsTrigger>
              <TabsTrigger value="report">{tCommon("report")}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dataForm">
            <div className="bg-gray-50 lg:rounded lg:shadow">
              <DawatiForm />
            </div>
          </TabsContent>

          <TabsContent value="report">
            <div className="bg-gray-50 rounded shadow">
              <UniversalTableShow
                userData={userData}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DawatiPage;
