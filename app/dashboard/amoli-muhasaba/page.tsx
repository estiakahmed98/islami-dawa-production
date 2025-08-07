"use client";

import React, { useEffect, useState } from "react";
import AmoliMuhasabaForm from "@/components/AmoliMuhasabaForm";
import UniversalTableShow from "@/components/TableShow";
import { useSession } from "@/lib/auth-client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";

const AmoliMuhasabaPage: React.FC = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>({ records: [] });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const userEmail = session?.user?.email;

  useEffect(() => {
    const fetchAmoliData = async () => {
      if (!userEmail) return;

      try {
        const res = await fetch(`/api/amoli?email=${userEmail}`);
        const json = await res.json();
        
        // Transform the API response to match the expected format
        const transformedData = {
          records: {
            [userEmail]: json.records.reduce((acc: any, record: any) => {
              const date = new Date(record.date).toISOString().split('T')[0];
              acc[date] = {
                tahajjud: record.tahajjud,
                surah: record.surah,
                ayat: record.ayat,
                zikir: record.zikir,
                ishraq: record.ishraq,
                jamat: record.jamat,
                sirat: record.sirat,
                Dua: record.Dua,
                ilm: record.ilm,
                tasbih: record.tasbih,
                dayeeAmol: record.dayeeAmol,
                amoliSura: record.amoliSura,
                ayamroja: record.ayamroja,
                hijbulBahar: record.hijbulBahar,
                percentage: record.percentage,
                editorContent: record.editorContent
              };
              return acc;
            }, {})
          },
          labelMap: {
            tahajjud: "তাহাজ্জুদ",
            surah: "সুরাহ",
            ayat: "আয়াত",
            zikir: "যিকির",
            ishraq: "ইশরাক",
            jamat: "জামাত",
            sirat: "সীরাত",
            Dua: "দোয়া",
            ilm: "ইলম",
            tasbih: "তাসবিহ",
            dayeeAmol: "দায়ী আমল",
            amoliSura: "আমলী সূরা",
            ayamroja: "আয়ামে বীজ",
            hijbulBahar: "হিজবুল বাহার",
            percentage: "শতকরা হার",
            editorContent: "মন্তব্য / নোট"
          }
        };
        
        setUserData(transformedData);
      } catch (error) {
        console.error("Failed to fetch AmoliMuhasaba data:", error);
      }
    };

    fetchAmoliData();
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
            <AmoliMuhasabaForm />
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

export default AmoliMuhasabaPage;