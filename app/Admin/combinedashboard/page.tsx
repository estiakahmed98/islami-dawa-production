"use client";
import React, { useState } from "react";
import AmoliChart from "@/components/AmoliChart";
import TalimDonutChart from "@/components/TalimBisoyChart";
import Tally from "@/components/Tally";

import {
  moktobData_faysal,
  DayeBisoyData_faysal,
  DawatiBisoyData_faysal,
  DawatiMoslishData_faysal,
  JamatBisoyData_faysal,
  DineFeraData_faysal,
  SoforBisoyData_faysal,
  AmoliChartData_faysal,
  TalimDonutChartData1_faysal,
  TalimDonutChartData2_faysal,
} from "@/app/data/data_faysal";

import {
  moktobData_jewel,
  DayeBisoyData_jewel,
  DawatiBisoyData_jewel,
  DawatiMoslishData_jewel,
  JamatBisoyData_jewel,
  DineFeraData_jewel,
  SoforBisoyData_jewel,
  AmoliChartData_jewel,
  TalimDonutChartData1_jewel,
  TalimDonutChartData2_jewel,
} from "@/app/data/data_jewel"; // Import Jewel data

// Define types for the chart and tally data
interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TallyData {
  label: string;
  value: number;
  max: number;
}

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<"daily" | "yearly">("daily");

  // Function to combine Tally data
  const combineData = (
    faysalData: TallyData[],
    jewelData: TallyData[]
  ): TallyData[] => {
    return faysalData.map((faysalItem, index) => {
      const jewelItem = jewelData[index];

      // Combine values and max values
      const combinedValue = (faysalItem.value || 0) + (jewelItem.value || 0);
      const combinedMax = (faysalItem.max || 0) + (jewelItem.max || 0);

      return {
        label: faysalItem.label,
        value: combinedValue,
        max: combinedMax,
      };
    });
  };

  // Combine Faysal and Jewel data for Yearly Tab
  const combinedMoktobData = combineData(
    moktobData_faysal.data,
    moktobData_jewel.data
  );
  const combinedDayeBisoyData = combineData(
    DayeBisoyData_faysal.data,
    DayeBisoyData_jewel.data
  );
  const combinedDawatiBisoyData = combineData(
    DawatiBisoyData_faysal.data,
    DawatiBisoyData_jewel.data
  );
  const combinedDawatiMoslishData = combineData(
    DawatiMoslishData_faysal.data,
    DawatiMoslishData_jewel.data
  );
  const combinedJamatBisoyData = combineData(
    JamatBisoyData_faysal.data,
    JamatBisoyData_jewel.data
  );
  const combinedDineFeraData = combineData(
    DineFeraData_faysal.data,
    DineFeraData_jewel.data
  );
  const combinedSoforBisoyData = combineData(
    SoforBisoyData_faysal.data,
    SoforBisoyData_jewel.data
  );

  // Function to combine Amoli and Talim chart data
  const combineChartData = (
    faysalData: ChartData[],
    jewelData: ChartData[]
  ): ChartData[] => {
    return faysalData.map((faysalItem, index) => {
      const jewelItem = jewelData[index];

      const combinedValue =
        ((faysalItem.value || 0) + (jewelItem.value || 0)) / 2;

      return {
        ...faysalItem,
        value: combinedValue,
        name: faysalItem.name,
        color: faysalItem.color,
      };
    });
  };

  // Combine chart data
  const combinedAmoliChartData = combineChartData(
    AmoliChartData_faysal,
    AmoliChartData_jewel
  );

  const combinedTalimDonutChartData1 = combineChartData(
    TalimDonutChartData1_faysal,
    TalimDonutChartData1_jewel
  );

  const combinedTalimDonutChartData2 = combineChartData(
    TalimDonutChartData2_faysal,
    TalimDonutChartData2_jewel
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 pb-4 pt-2">
      {/* Render Combined Data */}
      <AmoliChart
        data={combinedAmoliChartData} // Combined Data
        innerRadius={70}
        outerRadius={115}
        startAngle={90}
        endAngle={450}
      />
      <TalimDonutChart
        data1={combinedTalimDonutChartData1} // Combined Data
        data2={combinedTalimDonutChartData2} // Combined Data
        innerRadius={60}
        outerRadius={100}
        startAngle={90}
        endAngle={450}
      />
      <Tally data={{ title: "মক্তব বিষয়", data: combinedMoktobData }} />
      <Tally data={{ title: "দা’য়ী বিষয়", data: combinedDayeBisoyData }} />
      <Tally data={{ title: "দাওয়াতি বিষয়", data: combinedDawatiBisoyData }} />
      <Tally
        data={{ title: "দাওয়াতি মজলিশ", data: combinedDawatiMoslishData }}
      />
      <Tally data={{ title: "জামাত বিষয়", data: combinedJamatBisoyData }} />
      <Tally
        data={{ title: "দ্বীনে ফিরে এসেছে", data: combinedDineFeraData }}
      />
      <Tally data={{ title: "সফর বিষয়", data: combinedSoforBisoyData }} />
    </div>
  );
};

export default Dashboard;
