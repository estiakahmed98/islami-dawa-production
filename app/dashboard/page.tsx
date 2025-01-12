"use client";

import React from "react";
import AmoliChart from "@/components/AmoliCharts";
import TalimDonutChart from "@/components/TalimBisoyChart";
import { allData } from "../data/allData";
import dynamic from "next/dynamic";
import { userAmoliBisoyData } from "../data/amoliMuhasabaUserData";
import Tally from "@/components/Tally";
import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userTalimData } from "@/app/data/talimBisoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userJamatBisoyUserData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBisoyData } from "@/app/data/userSoforBisoyData";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import AmoliTableShow from "@/components/TableShow";
import DemoComp from "@/components/DemoComp";

interface DashboardData {
  AmoliChartData?: any[];
  TalimDonutChartData1?: any[];
  TalimDonutChartData2?: any[];
}

const Dashboard: React.FC = () => {
  const userEmail: string | null =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;

  return (
    <div>
      <DemoComp />
      <div>
        <h1>Chart and Tally Show Component:</h1>
        <Tally
          userData={userMoktobBisoyData}
          email={"moni@gmail.com"}
          title="Moktob Tally"
        />
      </div>

      <div>
        <AmoliTableShow userData={userAmoliBisoyData} />
      </div>
      {/* <Dashboard /> */}
    </div>
  );
};

// Export dynamically to disable SSR
export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
