"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
import AmoliTableShow from "@/components/TableShow";
import DawatiMojlishForm from "@/components/DawatiMojlishForm";
import Loading from "@/app/[locale]/dashboard/loading";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type MojlishRow = {
  dawatterGuruttoMojlish?: number;
  mojlisheOnshogrohon?: number;
  alemderSatheyMojlish?: number;
  publicSatheyMojlish?: number;
  prosikkhonKormoshalaAyojon?: number;
  prosikkhonOnshogrohon?: number;
  jummahAlochona?: number;
  dhormoSova?: number;
  mashwaraPoint?: number;
  editorContent?: string | null;
};

// YYYY-MM-DD (Asia/Dhaka)
function dhakaYMD(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

const DawatiMojlisPage: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const tCommon = useTranslations("common");
  const tToast = useTranslations("dashboard.UserDashboard.toast");
  const tDM = useTranslations("dashboard.UserDashboard.dawatiMojlish");

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>({ records: {}, labelMap: {} });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const tDawati = useTranslations("dashboard.UserDashboard.dawati");

  const labelMap = useMemo(
    () => ({
      dawatterGuruttoMojlish: tDM("dawatterGuruttoMojlish"),
      mojlisheOnshogrohon: tDM("mojlisheOnshogrohon"),
      alemderSatheyMojlish: tDawati("alemderSatheyMojlish"),
      publicSatheyMojlish: tDawati("publicSatheyMojlish"),
      prosikkhonKormoshalaAyojon: tDM("prosikkhonKormoshalaAyojon"),
      prosikkhonOnshogrohon: tDM("prosikkhonOnshogrohon"),
      jummahAlochona: tDM("jummahAlochona"),
      dhormoSova: tDM("dhormoSova"),
      mashwaraPoint: tDM("mashwaraPoint"),
    }),
    [tDM, tDawati]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/dawatimojlish?email=${encodeURIComponent(userEmail)}&sort=asc`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();

        const records = (json?.records ?? []) as Array<{
          date: string | Date;
          dawatterGuruttoMojlish?: number;
          mojlisheOnshogrohon?: number;
          alemderSatheyMojlish?: number;
          publicSatheyMojlish?: number;
          prosikkhonKormoshalaAyojon?: number;
          prosikkhonOnshogrohon?: number;
          jummahAlochona?: number;
          dhormoSova?: number;
          mashwaraPoint?: number;
          editorContent?: string | null;
        }>;

        const shaped = records.reduce<Record<string, MojlishRow>>((acc, rec) => {
          const dateStr = dhakaYMD(new Date(rec.date));
          acc[dateStr] = {
            dawatterGuruttoMojlish: rec.dawatterGuruttoMojlish ?? 0,
            mojlisheOnshogrohon: rec.mojlisheOnshogrohon ?? 0,
            alemderSatheyMojlish: rec.alemderSatheyMojlish ?? 0,
            publicSatheyMojlish: rec.publicSatheyMojlish ?? 0,
            prosikkhonKormoshalaAyojon: rec.prosikkhonKormoshalaAyojon ?? 0,
            prosikkhonOnshogrohon: rec.prosikkhonOnshogrohon ?? 0,
            jummahAlochona: rec.jummahAlochona ?? 0,
            dhormoSova: rec.dhormoSova ?? 0,
            mashwaraPoint: rec.mashwaraPoint ?? 0,
            editorContent: rec.editorContent ?? "",
          };
          return acc;
        }, {});

        setUserData({ records: { [userEmail]: shaped }, labelMap });
      } catch (e) {
        console.error("Failed to fetch Dawati Mojlish records:", e);
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
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
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
              <DawatiMojlishForm />
            </div>
          </TabsContent>

          <TabsContent value="report">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow
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

export default DawatiMojlisPage;
