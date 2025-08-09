//Estiak

"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
import DineFirecheForm from "@/components/DineFirecheForm";
import AmoliTableShow from "@/components/TableShow";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

/** Format a date to YYYY-MM-DD in Dhaka time (safe) */
function dhakaYMD(d: Date) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

const DineFeraPage: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const [userData, setUserData] = React.useState<any>({ records: {} });
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());

  const labelMap = React.useMemo(
    () => ({
      nonMuslimMuslimHoise: "অমুসলিম মুসলিম হয়েছে",
      murtadIslamFireche: "মুরতাদ ইসলাম ফিরেছে",
    }),
    []
  );

  React.useEffect(() => {
    if (!userEmail) {
      setUserData({ records: {}, labelMap });
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/dinefera?email=${encodeURIComponent(userEmail)}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch Dine Fera records");

        // API shape: { isSubmittedToday, today, records }
        const json = await res.json();
        const all: Array<any> = Array.isArray(json.records) ? json.records : [];

        const transformed: Record<string, Record<string, any>> = { [userEmail]: {} };
        all.forEach((rec) => {
          const dateKey = dhakaYMD(new Date(rec.date));
          if (!dateKey) return;
          transformed[userEmail][dateKey] = {
            nonMuslimMuslimHoise: rec.nonMuslimMuslimHoise,
            murtadIslamFireche: rec.murtadIslamFireche,
            editorContent: rec.editorContent,
          };
        });

        setUserData({ records: transformed, labelMap });
      } catch (err: any) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Failed to fetch Dine Fera data:", err);
          toast.error("দ্বীনে ফেরার তথ্য আনা যায়নি।");
        }
      }
    })();

    return () => ac.abort();
  }, [userEmail, labelMap]);

  return (
    <div>
      <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="dataForm">তথ্য দিন</TabsTrigger>
            <TabsTrigger value="report">প্রতিবেদন</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dataForm">
          <div className="bg-gray-50 lg:rounded lg:shadow">
            <DineFirecheForm />
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

export default DineFeraPage;
