"use client";

import React from "react";
import AmoliChart from "@/components/AmoliCharts";
import TalimDonutChart from "@/components/TalimBisoyChart";
import Tally from "@/components/Tally";
import { allData } from "@/app/data/data_faysal";
import dynamic from "next/dynamic";
import AmoliTableShow from "./AmoliTableShow";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./TabButton";
import {
  userAmoliData,
  userMoktobBisoyData,
  userTalimData,
  userDayeData,
  userDawatiBisoyData,
  userDawatiMojlishData,
  userJamatBisoyUserData,
  userDineFeraData,
  userSoforBisoyData,
} from "@/app/data";

interface DashboardData {
  AmoliChartData?: Array<any>;
  TalimDonutChartData1?: Array<any>;
  TalimDonutChartData2?: Array<any>;
}

const Dashboard: React.FC = () => {
  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;

  const dashboardData: DashboardData | null = userEmail
    ? allData[userEmail] || null
    : null;

  return (
    <div>
      {/* Dashboard Section */}
      <div className="flex">
        <div className="grow grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 pb-4 pt-2">
          {dashboardData ? (
            <>
              <AmoliChart
                data={dashboardData?.AmoliChartData || []}
                innerRadius={70}
                outerRadius={115}
                startAngle={90}
                endAngle={450}
              />

              <TalimDonutChart
                data1={dashboardData?.TalimDonutChartData1 || []}
                data2={dashboardData?.TalimDonutChartData2 || []}
                innerRadius={50}
                outerRadius={90}
                startAngle={90}
                endAngle={450}
              />
            </>
          ) : (
            <div className="flex justify-center items-center h-full shadow-lg rounded-lg">
              <p>No data available for the current user.</p>
            </div>
          )}

          <Tally
            userData={userMoktobBisoyData}
            email={userEmail}
            title="Moktob Tally"
          />
          <Tally
            userData={userDawatiBisoyData}
            email={userEmail}
            title="Dawati Bisoy Tally"
          />
          <Tally
            userData={userDawatiMojlishData}
            email={userEmail}
            title="Dawati Mojlish Tally"
          />
          <Tally
            userData={userJamatBisoyUserData}
            email={userEmail}
            title="Jamat Bisoy Tally"
          />
          <Tally
            userData={userDineFeraData}
            email={userEmail}
            title="Dine Fire Asa Tally"
          />
          <Tally
            userData={userSoforBisoyData}
            email={userEmail}
            title="Sofor Bisoy Tally"
          />
          <Tally
            userData={userDayeData}
            email={userEmail}
            title="Daye Bisoy Tally"
          />
        </div>
      </div>

      <div className="border border-[#155E75] mt-10 rounded-xl overflow-y-auto">
        <Tabs defaultValue="Amolimusahaba" className="w-full p-4">
          <TabsList className="flex justify-center">
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
              <AmoliTableShow userData={userTalimData} />
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
              <AmoliTableShow userData={userDineFeraData} />
            </div>
          </TabsContent>
          <TabsContent value="sofor">
            <div className="bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userSoforBisoyData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
