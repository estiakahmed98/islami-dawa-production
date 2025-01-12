"use client";

import React from "react";
import AmoliChart from "@/components/AmoliCharts";
import TalimDonutChart from "@/components/TalimBisoyChart";
import { allData } from "../data/allData";
import dynamic from "next/dynamic";
import { userAmoliBisoyData } from "../data/amoliMuhasabaUserData";
import Tally from "@/components/Tally";
import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiMojlishData } from "../data/dawatiMojlishUserData";
import { userTalimBisoyData } from "../data/talimBisoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
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
      {/* <DemoComp /> */}
      <div className="grid grid-cols-3 gap-6">
        <Tally
          userData={userMoktobBisoyData}
          email={"moni@gmail.com"}
          title="Moktob Tally"
        />

        <Tally
          userData={userDawatiBisoyData}
          email={"moni@gmail.com"}
          title="Dawati Bisoy Tally"
        />
        <Tally
          userData={userDawatiMojlishData}
          email={"moni@gmail.com"}
          title="Dawati Mojlish Tally"
        />

        <Tally
          userData={userJamatBisoyUserData}
          email={"moni@gmail.com"}
          title="Jamat Bisoy Tally"
        />

        <Tally
          userData={userDineFeraData}
          email={"moni@gmail.com"}
          title="Dine Fireche Tally"
        />

        <Tally
          userData={userTalimBisoyData}
          email={"moni@gmail.com"}
          title="Talim Bisoy Tally"
        />

        <Tally
          userData={userDayeData}
          email={"moni@gmail.com"}
          title="Dayee Bisoy Tally"
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
