"use client"; //Juwel

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
      } else if (field === "ayat") {
        // Extract ayat number from range (e.g., "10-20")
        const [start, end] = value
          .split("-")
          .map((num: string) => parseInt(num, 10) || 0);
        return Math.abs((end || start) - start); // Return difference
      } else if (["surah", "ishraq", "ilm", "sirat"].includes(field)) {
        return value ? 1 : 0;
      } else if (field === "jamat") {
        const numValue = Number(value) || 0;
        return numValue >= 1 && numValue <= 5 ? numValue : 0;
      } else if (field === "tahajjud") {
        const numValue = Number(value) || 0;
        return numValue;
      } else if (
        [
          "Dua",
          "tasbih",
          "amoliSura",
          "hijbulBahar",
          "dayeeAmol",
          "ayamroja",
        ].includes(field)
      ) {
        return value === "হ্যাঁ" ? 1 : 0;
      }
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
        let percentageChange;
        totalFrom = isNaN(totalFrom) ? 0 : totalFrom;
        totalTo = isNaN(totalTo) ? 0 : totalTo;
        if (totalTo - totalFrom > 0) {
          percentageChange =
            ((Math.max(totalTo, totalFrom) - Math.min(totalTo, totalFrom)) /
              Math.min(totalTo, totalFrom)) *
            100;
        } else {
          percentageChange =
            -(
              (Math.max(totalTo, totalFrom) - Math.min(totalTo, totalFrom)) /
              Math.min(totalTo, totalFrom)
            ) * 100;
        }

        if (totalFrom === 0 && totalTo > 0) {
          change = "∞% ↑"; // Infinite increase
        } else if (totalFrom > 0 && totalTo === 0) {
          change = "-∞% ↓"; // Infinite decrease
        } else if (totalFrom === totalTo) {
          change = "0%";
        } else {
          change = `${percentageChange.toFixed(2)}% ${percentageChange > 0 ? "↑" : "↓"}`;
        }
      }

      return {
        label: userData.labelMap[metric],
        from: totalFrom,
        to: totalTo,
        change,
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

  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule; // Ensure correct function access
  };

  const convertToPDF = async () => {
    if (!comparisonData.length) {
      console.error("No data available for PDF generation");
      return;
    }

    const element = document.createElement("div");

    let tableHTML = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap');
            body {
              font-family: 'Noto Sans Bengali', sans-serif;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              text-align: center;
            }
            th, td {
              border: 1px solid #000;
              padding: 10px;
              text-align: center;
            }
            th {
              background-color: #16A085;
              color: white;
            }
            thead {
              display: table-header-group; 
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <h2>তুলনা রিপোর্ট</h2>
          <table>
            <thead>
              <tr>
                <th>Label</th>
                <th>${from}</th>
                <th>${to}</th>
                <th>Difference</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              ${comparisonData
                .map(
                  (item) => `
                    <tr>
                      <td>${item.label}</td>
                      <td>${item.from}</td>
                      <td>${item.to}</td>
                      <td style="color: ${item.isIncrease ? "green" : "red"};">${item.to - item.from}</td>
                      <td style="color: ${item.isIncrease ? "green" : "red"};">${item.change}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>`;

    element.innerHTML = tableHTML;

    try {
      const html2pdf = await getHtml2Pdf();

      html2pdf()
        .set({
          margin: 10,
          filename: `comparison_report.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(element)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.text(
              `Page ${i} of ${totalPages}`,
              pdf.internal.pageSize.getWidth() - 20,
              pdf.internal.pageSize.getHeight() - 5
            );
          }
        })
        .save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl">
        {/* Heading */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center lg:text-left">
          স্বাগতম,{" "}
          <span className="text-emerald-600">{session?.user?.name}</span>
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto justify-center lg:justify-end">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="bg-emerald-600 text-white font-semibold px-4 md:px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 w-full md:w-auto"
          >
            {showComparison ? "ড্যাশবোর্ডে ফিরে জান" : "📊 তুলনা দেখুন"}
          </button>

          {!showComparison && (
            <div className="flex gap-3 items-center w-full md:w-auto">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
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
                className="w-full sm:w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
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
        <div className="bg-white p-2 lg:p-6 rounded-lg shadow-md space-y-4">
          <div className="grid lg:flex lg:flex-wrap gap-4 items-center">
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
              <div className="grid lg:flex gap-2">
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
              <div className="grid max-w-sm:w-full lg:flex lg:gap-2">
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

          <div className="bg-gray-100 p-2 lg:p-4 rounded-lg shadow overflow-x-auto">
            {comparisonData.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300 text-sm lg:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">Label</th>
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">{from}</th>
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">{to}</th>
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">
                      Difference
                    </th>
                    <th className="border px-2 lg:px-4 py-1 lg:py-2">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td className="border px-2 lg:px-4 py-1 lg:py-2">
                        {item.label}
                      </td>
                      <td className="border px-2 lg:px-4 py-1 lg:py-2">
                        {item.from}
                      </td>
                      <td className="border px-2 lg:px-4 py-1 lg:py-2">
                        {item.to}
                      </td>
                      <td
                        className={`border px-2 lg:px-4 py-1 lg:py-2 font-bold ${item.isIncrease ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.to - item.from}
                      </td>
                      <td
                        className={`border px-2 lg:px-4 py-1 lg:py-2 font-bold ${item.isIncrease ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-600">
                Select values and click "Compare" to see results.
              </p>
            )}

            {comparisonData.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={convertToPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
                >
                  Download PDF
                </button>
              </div>
            )}
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
