"use client";

import React, { useEffect, useState } from "react";
import TalimForm from "@/components/TalimForm";
import UniversalTableShow from "@/components/TableShow";
import { useSession } from "@/lib/auth-client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";

const TalimPage: React.FC = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>({ records: [] });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isSubmittedToday, setIsSubmittedToday] = useState<boolean>(false);

  const userEmail = session?.user?.email;

  useEffect(() => {
    const fetchTalimData = async () => {
      if (!userEmail) return;

      try {
        const res = await fetch(`/api/talim?email=${userEmail}`);
        const json = await res.json();
        
        setIsSubmittedToday(json.isSubmittedToday);

        // If there's data, transform it to match the expected format
        if (json.data) {
          const transformedData = {
            records: {
              [userEmail]: {
                [new Date(json.data.date).toISOString().split('T')[0]]: {
                  mohilaTalim: json.data.mohilaTalim,
                  mohilaOnshogrohon: json.data.mohilaOnshogrohon,
                  editorContent: json.data.editorContent
                }
              }
            },
            labelMap: {
              mohilaTalim: "মহিলা তালিম",
              mohilaOnshogrohon: "মহিলা অংশগ্রহণ",
              editorContent: "মন্তব্য / নোট",
            }
          };
          setUserData(transformedData);
        } else {
          setUserData({
            records: { [userEmail]: {} },
            labelMap: {
              mohilaTalim: "মহিলা তালিম",
              mohilaOnshogrohon: "মহিলা অংশগ্রহণ",
              editorContent: "মন্তব্য / নোট"
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch Talim data:", error);
      }
    };

    fetchTalimData();
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
            <TalimForm 
              isSubmittedToday={isSubmittedToday} 
              setIsSubmittedToday={setIsSubmittedToday}
            />
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

export default TalimPage;