//app/dashboard/amoli-muhasaba/page.tsx
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
import { useTranslations } from "next-intl";

const AmoliMuhasabaPage: React.FC = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>({ records: [] });
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const t = useTranslations("dashboard.UserDashboard.amoli");
  const common = useTranslations("common");

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
              const date = new Date(record.date).toISOString().split("T")[0];
              // Format quarntilawat JSON for display
              const quarntilawatDisplay = record.quarntilawat
                ? `Para: ${record.quarntilawat.para || "-"}<br/>Page: ${record.quarntilawat.pageNo || "-"}<br/>Ayat: ${record.quarntilawat.ayat || "-"}`
                : "- -";

              acc[date] = {
                tahajjud: record.tahajjud,
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
                editorContent: record.editorContent,
                quarntilawat: quarntilawatDisplay,
              };
              return acc;
            }, {}),
          },
          labelMap: {
            tahajjud: t("tahajjud"),
            zikir: t("zikir"),
            quarntilawat: t("quarntilawat"),
            ishraq: t("ishraq"),
            jamat: t("jamat"),
            sirat: t("sirat"),
            Dua: t("dua"),
            ilm: t("ilm"),
            tasbih: t("tasbih"),
            dayeeAmol: t("dayeeAmol"),
            amoliSura: t("amoliSura"),
            ayamroja: t("ayamroja"),
            hijbulBahar: t("hijbulBahar"),
            percentage: t("percentage"),
          },
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
            <TabsTrigger value="dataForm">{common("dataForm")}</TabsTrigger>
            <TabsTrigger value="report">{common("report")}</TabsTrigger>
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
              htmlFields={["quarntilawat"]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AmoliMuhasabaPage;
