"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
import SoforBishoyForm from "@/components/SoforBishoyForm";
import AmoliTableShow from "@/components/TableShow";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

function dhakaYMD(d: Date) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function toNumberedHTML(arr: unknown): string {
  const list = Array.isArray(arr) ? arr.filter(Boolean).map(String) : [];
  if (list.length === 0) return "";
  return list.map((item, idx) => `${idx + 1}. ${item}`).join("<br/>");
}

const SoforPage: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const tCommon = useTranslations("common");
  const tToast = useTranslations("dashboard.UserDashboard.toast");
  const tSofor = useTranslations("dashboard.UserDashboard.soforbisoy");

  const [userData, setUserData] = useState<any>({ records: {} });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isSubmittedToday, setIsSubmittedToday] = useState<boolean>(false);

  useEffect(() => {
    const ac = new AbortController();

    const fetchToday = async () => {
      if (!userEmail) return;
      try {
        const res = await fetch(
          `/api/soforbisoy?email=${encodeURIComponent(userEmail)}&mode=today`,
          { cache: "no-store", signal: ac.signal }
        );
        if (!res.ok) throw new Error("Failed to check today");
        const json = await res.json();
        setIsSubmittedToday(!!json.isSubmittedToday);
      } catch (e) {
        if (!(e instanceof DOMException && (e as DOMException).name === "AbortError")) {
          console.error(e);
        }
      }
    };

    const fetchAll = async () => {
      if (!userEmail) return;
      try {
        const res = await fetch(
          `/api/soforbisoy?email=${encodeURIComponent(userEmail)}`,
          { cache: "no-store", signal: ac.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch records");
        const json = await res.json();

        const all: Array<any> = Array.isArray(json.records) ? json.records : [];
        const transformed: Record<string, Record<string, any>> = { [userEmail]: {} };

        all.forEach((rec) => {
          const dateKey = dhakaYMD(new Date(rec.date));
          if (!dateKey) return;
          transformed[userEmail][dateKey] = {
            moktobVisit: rec.moktobVisit ?? 0,
            madrasaVisit: rec.madrasaVisit ?? 0,
            schoolCollegeVisit: rec.schoolCollegeVisit ?? 0,
            madrasaVisitList: toNumberedHTML(rec.madrasaVisitList),
            schoolCollegeVisitList: toNumberedHTML(rec.schoolCollegeVisitList),
            editorContent: rec.editorContent ?? "",
          };
        });

        setUserData({
          records: transformed,
          labelMap: {
            moktobVisit: tSofor("moktobVisit"),
            madrasaVisit: tSofor("madrasaVisit"),
            madrasaVisitList: tSofor("madrasaVisitList"),
            schoolCollegeVisit: tSofor("schoolCollegeVisit"),
            schoolCollegeVisitList: tSofor("schoolCollegeVisitList"),
          },
        });
      } catch (error) {
        if (!(error instanceof DOMException && (error as DOMException).name === "AbortError")) {
          console.error("Failed to fetch Sofor data:", error);
          toast.error(tToast("errorFetchingData"));
        }
      }
    };

    fetchToday();
    fetchAll();
    return () => ac.abort();
  }, [userEmail, tSofor, tToast]);

  return (
    <div>
      <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="dataForm">{tCommon("dataForm")}</TabsTrigger>
            <TabsTrigger value="report">{tCommon("report")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dataForm">
          <div className="bg-gray-50 lg:rounded lg:shadow">
            <SoforBishoyForm
              isSubmittedToday={isSubmittedToday}
              setIsSubmittedToday={setIsSubmittedToday}
            />
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
    </div>
  );
};

export default SoforPage;
