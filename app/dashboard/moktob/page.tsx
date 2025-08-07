"use client";

import React, { useEffect, useState } from "react";
import MoktobBishoyForm from "@/components/MoktobBishoyForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import { useSession } from "@/lib/auth-client";
import UniversalTableShow from "@/components/TableShow";

const MoktobPage: React.FC = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>({ records: {} });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const userEmail = session?.user?.email;

  useEffect(() => {
    const fetchMoktobData = async () => {
      if (!userEmail) return;

      try {
        const res = await fetch(`/api/moktob?email=${userEmail}`);
        const json = await res.json();
        const records = json.records || [];

        const transformedData = {
          records: {
            [userEmail]: records.reduce((acc: any, record: any) => {
              const date = new Date(record.date).toISOString().split("T")[0];
              acc[date] = {
                notunMoktobChalu: record.notunMoktobChalu,
                totalMoktob: record.totalMoktob,
                totalStudent: record.totalStudent,
                obhibhabokConference: record.obhibhabokConference,
                moktoThekeMadrasaAdmission: record.moktoThekeMadrasaAdmission,
                notunBoyoskoShikkha: record.notunBoyoskoShikkha,
                totalBoyoskoShikkha: record.totalBoyoskoShikkha,
                boyoskoShikkhaOnshogrohon: record.boyoskoShikkhaOnshogrohon,
                newMuslimeDinerFikir: record.newMuslimeDinerFikir,
                editorContent: record.editorContent,
              };
              return acc;
            }, {}),
          },
          labelMap: {
            notunMoktobChalu: "নতুন মক্তব চালু",
            totalMoktob: "মোট মক্তব",
            totalStudent: "মোট শিক্ষার্থী",
            obhibhabokConference: "অভিভাবক সম্মেলন",
            moktoThekeMadrasaAdmission: "মক্তব থেকে মাদরাসা ভর্তি",
            notunBoyoskoShikkha: "নতুন বয়স্ক শিক্ষা",
            totalBoyoskoShikkha: "মোট বয়স্ক শিক্ষা",
            boyoskoShikkhaOnshogrohon: "বয়স্ক শিক্ষা অংশগ্রহণ",
            newMuslimeDinerFikir: "নতুন মুসলিমের দীন চিন্তা",
          },
        };

        setUserData(transformedData);
      } catch (error) {
        console.error("Failed to fetch Moktob data:", error);
      }
    };

    fetchMoktobData();
  }, [userEmail]);

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
            <MoktobBishoyForm />
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

export default MoktobPage;
