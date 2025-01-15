"use client";

import React from "react";
import AmoliChart from "@/components/AmoliCharts";
import dynamic from "next/dynamic";
import { userAmoliData } from "../data/amoliMuhasabaUserData";
import Tally from "@/components/Tally";
import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiMojlishData } from "../data/dawatiMojlishUserData";
import { userTalimBisoyData } from "../data/talimBisoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userJamatBisoyData } from "../data/jamatBisoyData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBisoyData } from "@/app/data/userSoforBisoyData";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import { useSession } from "next-auth/react";
import AmoliTableShow from "@/components/TableShow";

interface TallyProps {
  userData: Record<string, any>;
  email: string;
  title: string;
}

const Dashboard: React.FC<TallyProps> = ({ userData, email, title }) => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  // console.log("Session", session);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome,{"  "}
          <span className="text-2xl text-emerald-600">
            {session?.user?.name}
          </span>
        </h1>
      </div>
      <div className="grid xl:grid-cols-3 p-6 gap-6 overflow-y-auto border border-[#155E75] rounded-xl">
        <AmoliChart data={userAmoliData.records} userEmail={userEmail} />
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
          userData={userJamatBisoyData}
          email={userEmail}
          title="Jamat Bisoy Tally"
        />

        <Tally
          userData={userDineFeraData}
          email={userEmail}
          title="Dine Fireche Tally"
        />

        <Tally
          userData={userTalimBisoyData}
          email={userEmail}
          title="Talim Bisoy Tally"
        />

        <Tally
          userData={userSoforBisoyData}
          email={userEmail}
          title="Sofor Bisoy Tally"
        />

        <Tally
          userData={userDayeData}
          email={userEmail}
          title="Dayee Bisoy Tally"
        />
      </div>

      <div className="border border-[#155E75] p-6 mt-10 rounded-xl overflow-y-auto">
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
