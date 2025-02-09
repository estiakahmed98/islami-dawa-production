
"use client";
import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";

import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";

const fetchComparisonData = (comparisonType: string, date1: string, date2: string) => {
  const datasets = [
    { name: "Amoli", data: userAmoliData },
    { name: "Moktob Bisoy", data: userMoktobBisoyData },
    { name: "Dawati Bisoy", data: userDawatiBisoyData },
    { name: "Dawati Mojlish", data: userDawatiMojlishData },
    { name: "Jamat Bisoy", data: userJamatBisoyData },
    { name: "Dine Fera", data: userDineFeraData },
    { name: "Sofor Bisoy", data: userSoforBishoyData },
    { name: "Daye", data: userDayeData },
    { name: "Talim Bisoy", data: userTalimBisoyData },
  ];

  return datasets.map(({ name, data }) => {
    if (!data.records) return null;

    const metrics = Object.keys(data.labelMap);

    return metrics.map((metric) => {
      let totalDate1 = 0;
      let totalDate2 = 0;

      Object.values(data.records).forEach((userRecords: any) => {
        if (userRecords[date1] && userRecords[date1][metric]) {
          totalDate1 += Number(userRecords[date1][metric]);
        }
        if (userRecords[date2] && userRecords[date2][metric]) {
          totalDate2 += Number(userRecords[date2][metric]);
        }
      });

      let change = "N/A";
      if (totalDate2 > 0) {
        change = ((totalDate1 - totalDate2) / totalDate2) * 100;
        change = `${change.toFixed(2)}%`;
      }

      return {
        label: data.labelMap[metric],
        date1: totalDate1 || "No Data",
        date2: totalDate2 || "No Data",
        change: change,
      };
    });
  }).flat();
};

const ComparisonPage: React.FC = () => {
  const { data: session } = useSession();
  const [comparisonType, setComparisonType] = useState("day");
  const [date1, setDate1] = useState(new Date().toISOString().split("T")[0]);
  const [date2, setDate2] = useState(new Date().toISOString().split("T")[0]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  const handleCompare = () => {
    const data = fetchComparisonData(comparisonType, date1, date2);
    setComparisonData(Array.isArray(data) ? data : []);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Comparison Page</h1>
      <div className="flex gap-4 mb-6">
        <select
          value={comparisonType}
          onChange={(e) => setComparisonType(e.target.value)}
          className="border px-4 py-2 rounded-md shadow-sm"
        >
          <option value="day">Day-to-Day</option>
          <option value="month">Month-to-Month</option>
          <option value="year">Year-to-Year</option>
        </select>
        <input
          type="date"
          value={date1}
          onChange={(e) => setDate1(e.target.value)}
          className="border px-4 py-2 rounded-md shadow-sm"
        />
        <input
          type="date"
          value={date2}
          onChange={(e) => setDate2(e.target.value)}
          className="border px-4 py-2 rounded-md shadow-sm"
        />
        <button
          onClick={handleCompare}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
        >
          Compare
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow">
        {comparisonData.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Label</th>
                <th className="border px-4 py-2">{date1}</th>
                <th className="border px-4 py-2">{date2}</th>
                <th className="border px-4 py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{item.label}</td>
                  <td className="border px-4 py-2">{item.date1}</td>
                  <td className="border px-4 py-2">{item.date2}</td>
                  <td
                    className={`border px-4 py-2 font-bold ${parseFloat(item.change) > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No comparison data available. Select date range and click compare.</p>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;