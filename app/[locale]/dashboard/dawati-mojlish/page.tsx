"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import AmoliTableShow from "@/components/TableShow";
import DawatiMojlishForm from "@/components/DawatiMojlishForm";
import Loading from "@/app/[locale]/dashboard/loading";

type MojlishRow = {
  dawatterGuruttoMojlish?: number;
  mojlisheOnshogrohon?: number;
  prosikkhonKormoshalaAyojon?: number;
  prosikkhonOnshogrohon?: number;
  jummahAlochona?: number;
  dhormoSova?: number;
  mashwaraPoint?: number;
  editorContent?: string | null;
};

const DawatiMojlisPage: React.FC = () => {
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
        const res = await fetch(
          `/api/dawatimojlish?email=${encodeURIComponent(userEmail)}&sort=asc`
        );
        const json = await res.json();

        const records = (json?.records ?? []) as Array<{
          date: string | Date;
          dawatterGuruttoMojlish?: number;
          mojlisheOnshogrohon?: number;
          prosikkhonKormoshalaAyojon?: number;
          prosikkhonOnshogrohon?: number;
          jummahAlochona?: number;
          dhormoSova?: number;
          mashwaraPoint?: number;
          editorContent?: string | null;
        }>;

        const shaped = records.reduce<Record<string, MojlishRow>>((acc, rec) => {
          const dateStr = new Date(rec.date).toISOString().split("T")[0];
          acc[dateStr] = {
            dawatterGuruttoMojlish: rec.dawatterGuruttoMojlish ?? 0,
            mojlisheOnshogrohon: rec.mojlisheOnshogrohon ?? 0,
            prosikkhonKormoshalaAyojon: rec.prosikkhonKormoshalaAyojon ?? 0,
            prosikkhonOnshogrohon: rec.prosikkhonOnshogrohon ?? 0,
            jummahAlochona: rec.jummahAlochona ?? 0,
            dhormoSova: rec.dhormoSova ?? 0,
            mashwaraPoint: rec.mashwaraPoint ?? 0,
            editorContent: rec.editorContent ?? "",
          };
          return acc;
        }, {});

        setUserData({
          records: { [userEmail]: shaped },
          labelMap: {
            dawatterGuruttoMojlish: "দাওয়াতের গুরুত্ব বিষয়ে মজলিশ",
            mojlisheOnshogrohon: "মজলিশে অংশগ্রহণ",
            prosikkhonKormoshalaAyojon: "প্রশিক্ষণ কর্মশালা আয়োজন",
            prosikkhonOnshogrohon: "প্রশিক্ষণে অংশগ্রহণ",
            jummahAlochona: "জুমা আলোচনা",
            dhormoSova: "ধর্মীয় সভা",
            mashwaraPoint: "মাশওয়ারা পয়েন্ট",
          },
        });
      } catch (e) {
        console.error("Failed to fetch Dawati Mojlish records:", e);
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
    </div>
  );
};

export default DawatiMojlisPage;
