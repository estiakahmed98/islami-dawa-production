"use client";
import DayeeBishoyForm from "@/components/DayeeBishoyForm";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import UniversalTableShow from "@/components/TableShow";
import { useSession } from "@/lib/auth-client";

const DayiPage: React.FC = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [userData, setUserData] = useState<any>({ records: {}, labelMap: {} });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchDayeeData = async () => {
      if (!userEmail) return;
      try {
        const res = await fetch(`/api/dayi?email=${userEmail}`);
        const json = await res.json();
        const records = json.records || [];
        const transformed = {
          records: {
            [userEmail]: records.reduce((acc: any, record: any) => {
              const date = new Date(record.date).toISOString().split("T")[0];
              acc[date] = {
                sohojogiDayeToiri: record.sohojogiDayeToiri,
                editorContent: record.editorContent,
                assistants: record.assistants.map((a: any) => a.name).join(", "),
              };
              return acc;
            }, {}),
          },
          labelMap: {
            sohojogiDayeToiri: "সহযোগী দায়ী তৈরি",
            assistants: "সহযোগী দায়ীর নামসমূহ",
          },
        };
        setUserData(transformed);
      } catch (error) {
        console.error("Failed to fetch Dayee data:", error);
      }
    };
    fetchDayeeData();
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
            <DayeeBishoyForm />
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

export default DayiPage;
