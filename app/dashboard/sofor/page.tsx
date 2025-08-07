"use client";

import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import SoforBishoyForm from "@/components/SoforBishoyForm";
import AmoliTableShow from "@/components/TableShow";
import { useSession } from "@/lib/auth-client";

const SoforPage: React.FC = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>({ records: [] });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isSubmittedToday, setIsSubmittedToday] = useState<boolean>(false);

  const userEmail = session?.user?.email;

  useEffect(() => {
    const fetchSoforData = async () => {
      if (!userEmail) return;

      try {
        const res = await fetch(`/api/soforbisoy?email=${userEmail}`);
        const json = await res.json();

        setIsSubmittedToday(json.isSubmittedToday);

        if (json.data) {
          const transformedData = {
            records: {
              [userEmail]: {
                [new Date(json.data.date).toISOString().split('T')[0]]: {
                  moktobVisit: json.data.moktobVisit,
                  madrasaVisit: json.data.madrasaVisit,
                  schoolCollegeVisit: json.data.schoolCollegeVisit,
                  editorContent: json.data.editorContent
                }
              }
            },
            labelMap: {
              moktobVisit: "চলমান মক্তব পরিদর্শন হয়েছে",
              madrasaVisit: "মাদ্রাসা সফর হয়েছে",
              schoolCollegeVisit: "স্কুল/কলেজ সফর হয়েছে",
             
            }
          };
          setUserData(transformedData);
        } else {
          setUserData({
            records: { [userEmail]: {} },
            labelMap: {
              moktobVisit: "চলমান মক্তব পরিদর্শন হয়েছে",
              madrasaVisit: "মাদ্রাসা সফর হয়েছে",
              schoolCollegeVisit: "স্কুল/কলেজ সফর হয়েছে",
              editorContent: "মতামত"
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch Sofor data:", error);
      }
    };

    fetchSoforData();
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
