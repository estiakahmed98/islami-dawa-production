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
    <div className="space-y-4">
      <div className="grid xl:grid-cols-3 gap-6">
        <AmoliChart
          data={userAmoliBisoyData.records}
          userEmail="moni@gmail.com"
        />
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
          userData={userSoforBisoyData}
          email={"moni@gmail.com"}
          title="Sofor Bisoy Tally"
        />

        <Tally
          userData={userDayeData}
          email={"moni@gmail.com"}
          title="Dayee Bisoy Tally"
        />
      </div>

      {/* <div>
        <AmoliTableShow userData={userAmoliBisoyData} />
      </div> */}
      {/* <Dashboard /> */}
      <div className="border border-[#155E75] mt-10 rounded-xl overflow-y-auto">
        <Tabs defaultValue="Amolimusahaba" className="w-full p-4">
          <TabsList className="mx-10 my-6">
            <TabsTrigger value="Amolimusahaba">Amolimusahaba</TabsTrigger>
            <TabsTrigger value="moktob">Moktob Bisoy</TabsTrigger>
            <TabsTrigger value="talim">Talim Bisoy</TabsTrigger>
            <TabsTrigger value="daye">Daye Bisoy</TabsTrigger>
            <TabsTrigger value="dawati">Dawati Bisoy</TabsTrigger>
            <TabsTrigger value="dawatimojlish">Dawati Mojlish</TabsTrigger>
            <TabsTrigger value="jamat">Jamat Bisoy</TabsTrigger>
            <TabsTrigger value="dinefera">Dine Fire Asa</TabsTrigger>
            <TabsTrigger value="sofor">Sofor Bisoy</TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="Amolimusahaba">
            <div className="bg-gray-50 rounded shadow">
              {/* <AmoliTableShow userData={userAmoliData} /> */}
              <AmoliTableShow userData={userAmoliBisoyData} />
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
              <AmoliTableShow userData={userJamatBisoyUserData} />
            </div>
          </TabsContent>
          <TabsContent value="dinefera">
            <div className="bg-gray-50 rounded shadow">
              {/* <FinalReportTable /> */}
              <AmoliTableShow userData={userDineFeraData} />
            </div>
          </TabsContent>
          <TabsContent value="sofor">
            <div className="bg-gray-50 rounded shadow">
              {/* <FinalReportTable /> */}
              <AmoliTableShow userData={userSoforBisoyData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Export dynamically to disable SSR
export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
