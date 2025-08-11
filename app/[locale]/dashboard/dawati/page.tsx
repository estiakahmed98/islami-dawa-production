"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import UniversalTableShow from "@/components/TableShow"; // same component used elsewhere
import DawatiForm from "@/components/DawatiForm";
import Loading from "@/app/[locale]/dashboard/loading";

type RecordRow = {
  nonMuslimDawat?: number;
  murtadDawat?: number;
  alemderSatheyMojlish?: number;
  publicSatheyMojlish?: number;
  nonMuslimSaptahikGasht?: number;
  editorContent?: string | null;
};

const DawatiPage: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>({ records: {}, labelMap: {} });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/dawati?email=${encodeURIComponent(userEmail)}&sort=asc`);
        const json = await res.json();

        const records = (json?.records ?? []) as Array<{
          date: string | Date;
          nonMuslimDawat?: number;
          murtadDawat?: number;
          alemderSatheyMojlish?: number;
          publicSatheyMojlish?: number;
          nonMuslimSaptahikGasht?: number;
          editorContent?: string | null;
        }>;

        // Transform for UniversalTableShow: records[email][YYYY-MM-DD] = { fields... }
        const shaped = records.reduce<Record<string, RecordRow>>((acc, rec) => {
          const dateStr = new Date(rec.date).toISOString().split("T")[0];
          acc[dateStr] = {
            nonMuslimDawat: rec.nonMuslimDawat ?? 0,
            murtadDawat: rec.murtadDawat ?? 0,
            alemderSatheyMojlish: rec.alemderSatheyMojlish ?? 0,
            publicSatheyMojlish: rec.publicSatheyMojlish ?? 0,
            nonMuslimSaptahikGasht: rec.nonMuslimSaptahikGasht ?? 0,
            editorContent: rec.editorContent ?? "",
          };
          return acc;
        }, {});

        setUserData({
          records: { [userEmail]: shaped },
          labelMap: {
            nonMuslimDawat: "অমুসলিম দাওয়াত",
            murtadDawat: "মুরতাদ দাওয়াত",
            alemderSatheyMojlish: "আলেমদের সাথে মজলিশ",
            publicSatheyMojlish: "সাধারণ জনগণের সাথে মজলিশ",
            nonMuslimSaptahikGasht: "অমুসলিম সাপ্তাহিক গশত",
          },
        });
      } catch (e) {
        console.error("Failed to fetch Dawati records:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  if (loading) return <Loading />;

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
            {/* Make sure DawatiForm posts to /api/dawati */}
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
    </div>
  );
};

export default DawatiPage;
