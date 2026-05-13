"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import { useSession } from "@/lib/auth-client";
import DayeeFiveForm from "./DayeeFiveForm";
import DayeeFiveReportTable from "./DayeeFiveReportTable";
import { toast } from "sonner";

const DayeeFivePage = () => {
  const { data: session } = useSession();

  const userEmail = useMemo(
    () => session?.user?.email ?? "",
    [session?.user?.email],
  );

  const [records, setRecords] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  const fetchedKeyRef = useRef("");

  const fetchRecords = async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(
        `/api/dayee-five?email=${encodeURIComponent(userEmail)}`,
        { cache: "no-store" },
      );

      if (!res.ok) throw new Error("Failed to fetch records");

      const json = await res.json();
      setRecords(json.records || []);
    } catch (error) {
      console.error(error);
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
    }
  };

  useEffect(() => {
    if (!userEmail) return;

    const key = `${userEmail}-${selectedMonth}-${selectedYear}`;

    if (fetchedKeyRef.current === key) return;
    fetchedKeyRef.current = key;

    fetchRecords();
  }, [userEmail, selectedMonth, selectedYear]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchedKeyRef.current = "";
      fetchRecords();
    };

    window.addEventListener("dayee-five-data-refresh", handleRefresh);

    return () => {
      window.removeEventListener("dayee-five-data-refresh", handleRefresh);
    };
  }, [userEmail]);

  return (
    <div>
      <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="dataForm">৫ কাজে যোগ করুন</TabsTrigger>
            <TabsTrigger value="report">রিপোর্ট দেখুন</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dataForm">
          <div className="bg-gray-50 lg:rounded lg:shadow">
            <DayeeFiveForm />
          </div>
        </TabsContent>

        <TabsContent value="report">
          <div className="rounded bg-gray-50 shadow">
            <DayeeFiveReportTable
              records={records}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onRefresh={fetchRecords}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DayeeFivePage;
