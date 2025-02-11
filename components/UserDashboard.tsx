"use client";

import React, { useState } from "react";
import AmoliChart from "@/components/AmoliCharts";
import dynamic from "next/dynamic";
import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";
import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { useRouter } from "next/navigation";
import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import { useSession } from "@/lib/auth-client";
import AmoliTableShow from "@/components/TableShow";
import TallyAdmin from "@/components/TallyAdmin";

interface TallyProps {
  userData: Record<string, any>;
  email: string;
  title: string;
}

const Dashboard: React.FC<TallyProps> = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  // console.log("Session", session);

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [searchMonth, setSearchMonth] = useState<string>(""); // Stores the search input

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const filterChartAndTallyData = (userData: any) => {
    if (!userData || !userData.records) return userData;

    const filteredRecords = Object.keys(userData.records).reduce<
      Record<string, any>
    >((filtered, email) => {
      const emailData = userData.records[email];

      // Filter records by selected month and year
      const filteredDates = Object.keys(emailData).reduce<Record<string, any>>(
        (acc, date) => {
          const [year, month] = date.split("-").map(Number);
          if (year === selectedYear && month === selectedMonth + 1) {
            acc[date] = emailData[date];
          }
          return acc;
        },
        {}
      );

      if (Object.keys(filteredDates).length > 0) {
        filtered[email] = filteredDates;
      }

      return filtered;
    }, {});

    return { ...userData, records: filteredRecords };
  };

  const filteredAmoliData = filterChartAndTallyData(userAmoliData);

  return (
    <div className="space-y-4">
      {/* <div>
        <h1 className="text-xl font-semibold">
          Welcome,{"  "}
          <span className="text-2xl text-emerald-600">
            {session?.user?.name}
          </span>
        </h1>
      </div> */}

      <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl">
        {/* Welcome Message */}
        <h1 className="text-2xl font-bold text-gray-800">
          স্বাগতম ,{" "}
          <span className="text-emerald-600">{session?.user?.name}</span>
        </h1>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => router.push("/comparison")}
            className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 focus:ring focus:ring-emerald-300"
          >
            📊 তুলনা দেখুন
          </button>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4 mt-4 lg:mt-0">
            {/* Month Selection Dropdown */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
              >
                {months
                  .filter(
                    (month) =>
                      month.toLowerCase().includes(searchMonth.toLowerCase()) // 🔍 Filters months dynamically
                  )
                  .map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
              </select>
            </div>

            {/* Year Selection Dropdown */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
              >
                {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 p-2 lg:p-6 gap-6 overflow-y-auto border border-[#155E75] rounded-xl">
        <AmoliChart data={filteredAmoliData.records} userEmail={userEmail} />

        <TallyAdmin
          userData={filterChartAndTallyData(userMoktobBisoyData)}
          emails={userEmail}
          title="মক্তব বিষয়"
        />

        <TallyAdmin
          userData={filterChartAndTallyData(userDawatiBisoyData)}
          emails={userEmail}
          title="দাওয়াতি বিষয়"
        />

        <TallyAdmin
          userData={filterChartAndTallyData(userDawatiMojlishData)}
          emails={userEmail}
          title="দাওয়াতি মজলিশ"
        />

        <TallyAdmin
          userData={filterChartAndTallyData(userJamatBisoyData)}
          emails={userEmail}
          title="জামাত বিষয়"
        />

        <TallyAdmin
          userData={filterChartAndTallyData(userDineFeraData)}
          emails={userEmail}
          title="দ্বীনে ফিরে এসেছে"
        />

        <TallyAdmin
          userData={filterChartAndTallyData(userTalimBisoyData)}
          emails={userEmail}
          title="মহিলাদের তালিম বিষয়"
        />

        <TallyAdmin
          userData={filterChartAndTallyData(userSoforBishoyData)}
          emails={userEmail}
          title="সফর বিষয়"
        />

        <TallyAdmin
          userData={filterChartAndTallyData(userDayeData)}
          emails={userEmail}
          title="দায়ী বিষয়"
        />
      </div>

      <div className="border border-[#155E75] p-2 lg:p-6 mt-10 rounded-xl overflow-y-auto">
        <Tabs defaultValue="Amolimusahaba" className="w-full  lg:p-4">
          <TabsList className="mx-10 grid grid-cols-2 md:grid-cols-4 my-6">
            <TabsTrigger value="Amolimusahaba">আ’মলি মুহাসাবা</TabsTrigger>
            <TabsTrigger value="moktob">মক্তব বিষয়</TabsTrigger>
            <TabsTrigger value="talim">মহিলাদের তালিম বিষয়</TabsTrigger>
            <TabsTrigger value="daye">দায়ী বিষয়</TabsTrigger>
            <TabsTrigger value="dawati">দাওয়াতি বিষয়</TabsTrigger>
            <TabsTrigger value="dawatimojlish">দাওয়াতি মজলিশ</TabsTrigger>
            <TabsTrigger value="jamat">জামাত বিষয়</TabsTrigger>
            <TabsTrigger value="dinefera">দ্বীনে ফিরে এসেছে</TabsTrigger>
            <TabsTrigger value="sofor">সফর বিষয়</TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="Amolimusahaba">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userAmoliData} />
            </div>
          </TabsContent>
          <TabsContent value="moktob">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userMoktobBisoyData} />
            </div>
          </TabsContent>
          <TabsContent value="talim">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userTalimBisoyData} />
            </div>
          </TabsContent>
          <TabsContent value="daye">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userDayeData} />
            </div>
          </TabsContent>
          <TabsContent value="dawati">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userDawatiBisoyData} />
            </div>
          </TabsContent>
          <TabsContent value="dawatimojlish">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userDawatiMojlishData} />
            </div>
          </TabsContent>
          <TabsContent value="jamat">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userJamatBisoyData} />
            </div>
          </TabsContent>
          <TabsContent value="dinefera">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userDineFeraData} />
            </div>
          </TabsContent>
          <TabsContent value="sofor">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userSoforBishoyData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Export dynamically to disable SSR
// export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
export default Dashboard;
