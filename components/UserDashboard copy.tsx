"use client";

import React, { useState } from "react";
import AmoliChart from "@/components/AmoliCharts";
import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";
import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
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
import ComparisonTallyCard from "@/components/ComparisonTallyCard";

interface TallyProps {
  userData: Record<string, any>;
  email: string;
  title: string;
}

const Dashboard: React.FC<TallyProps> = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  // State for main dashboard
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // State for comparison feature
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonType, setComparisonType] = useState("day");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [comparisonData, setComparisonData] = useState<any[]>([]);

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

  // Filter data by selected month and year
  const filterChartAndTallyData = (userData: any) => {
    if (!userData || !userData.records) return userData;

    const filteredRecords = Object.keys(userData.records).reduce<
      Record<string, any>
    >((filtered, email) => {
      const emailData = userData.records[email];
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

  // Convert values to points for comparison
  const convertToPoints = (value: any, field: string): number => {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      value = value.trim();
      if (field === "zikir") {
        if (value === "সকাল-সন্ধ্যা") return 2;
        if (value === "সকাল" || value === "সন্ধ্যা") return 1;
        return 0;
      }
      // Add other field conversions here
    }
    return 0;
  };

  // Fetch comparison data
  const fetchUserComparisonData = (
    userData: any,
    comparisonType: string,
    from: string,
    to: string
  ) => {
    if (!userData?.records) return [];
    const userRecords = userData.records[userEmail] || {};

    return Object.keys(userData.labelMap).map((metric) => {
      let totalFrom = 0;
      let totalTo = 0;

      if (comparisonType === "day") {
        totalFrom += convertToPoints(userRecords[from]?.[metric], metric);
        totalTo += convertToPoints(userRecords[to]?.[metric], metric);
      } else {
        Object.keys(userRecords).forEach((date) => {
          if (comparisonType === "month" && date.startsWith(from))
            totalFrom += convertToPoints(userRecords[date]?.[metric], metric);
          if (comparisonType === "month" && date.startsWith(to))
            totalTo += convertToPoints(userRecords[date]?.[metric], metric);
          else if (comparisonType === "year" && date.startsWith(from))
            totalFrom += convertToPoints(userRecords[date]?.[metric], metric);
          if (comparisonType === "year" && date.startsWith(to))
            totalTo += convertToPoints(userRecords[date]?.[metric], metric);
        });
      }

      let change = "0%";
      if (totalFrom === 0 && totalTo > 0) {
        change = "∞% ↑";
      } else if (totalFrom > 0 && totalTo === 0) {
        change = "-∞% ↓";
      } else if (totalFrom === totalTo) {
        change = "0%";
      } else {
        let percentageChange =
          (Math.abs(totalTo - totalFrom) / Math.max(totalFrom, 1)) * 100;
        change = `${percentageChange.toFixed(2)}% ${totalTo > totalFrom ? "↑" : "↓"}`;
      }

      return {
        label: userData.labelMap[metric],
        from: totalFrom,
        to: totalTo,
        onchange: change,
        isIncrease: change.includes("↑"),
      };
    });
  };

  // Handle comparison button click
  const handleCompare = () => {
    if (!from || !to) {
      alert("Please select both 'From' and 'To' values.");
      return;
    }

    const allData = [
      userAmoliData,
      userMoktobBisoyData,
      userDawatiBisoyData,
      userDawatiMojlishData,
      userJamatBisoyData,
      userDineFeraData,
      userTalimBisoyData,
      userSoforBishoyData,
      userDayeData,
    ];

    const combinedData = allData.flatMap((data) =>
      fetchUserComparisonData(data, comparisonType, from, to)
    );

    setComparisonData(combinedData);
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800">
          স্বাগতম ,{" "}
          <span className="text-emerald-600">{session?.user?.name}</span>
        </h1>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300"
          >
            {showComparison ? "ড্যাশবোর্ডে ফিরে জান" : "📊 তুলনা দেখুন"}
          </button>

          {!showComparison && (
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
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
          )}
        </div>
      </div>

      {showComparison ? (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
              className="border px-4 py-2 rounded-md shadow-sm"
            >
              <option value="day">দিন অনুযায়ী</option>
              <option value="month">মাস অনুযায়ী</option>
              <option value="year">বছর অনুযায়ী</option>
            </select>

            {comparisonType === "day" && (
              <>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                />
              </>
            )}

            {comparisonType === "month" && (
              <div className="flex gap-2 items-center">
                <input
                  type="month"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                />
                <span className="font-bold">থেকে</span>
                <input
                  type="month"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                />
              </div>
            )}

            {comparisonType === "year" && (
              <div className="flex gap-2 items-center">
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => 2020 + i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>
                <span className="font-bold">থেকে</span>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border px-4 py-2 rounded-md shadow-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => 2020 + i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            <button
              onClick={handleCompare}
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
            >
              তুলনা করুন
            </button>
          </div>

          {comparisonData.length > 0 && (
            <ComparisonTallyCard
              currentData={comparisonData.map((item) => ({
                label: item.label,
                value: item.to,
              }))}
              previousData={comparisonData.map((item) => ({
                label: item.label,
                value: item.from,
              }))}
            />
          )}
        </div>
      ) : (
        <>
          <div className="grid xl:grid-cols-3 p-2 lg:p-6 gap-6 overflow-y-auto border border-[#155E75] rounded-xl">
            <AmoliChart
              data={filterChartAndTallyData(userAmoliData).records}
              userEmail={userEmail}
            />
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
            <Tabs defaultValue="Amolimusahaba" className="w-full lg:p-4">
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
