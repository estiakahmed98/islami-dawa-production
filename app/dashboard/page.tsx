"use client";

import React from "react";
import AmoliChart from "@/components/AmoliCharts";
import dynamic from "next/dynamic";
import { userAmoliData } from "../data/amoliMuhasabaUserData";
import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiMojlishData } from "../data/dawatiMojlishUserData";
import { userTalimBisoyData } from "../data/talimBisoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userJamatBisoyData } from "../data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBishoyData } from "../data/soforBishoyUserData";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import { useSession } from "next-auth/react";
import AmoliTableShow from "@/components/TableShow";
import TallyAdmin from "@/components/TallyAdmin";
// import AmoliYearlyTable from "@/components/TableYearly";

interface TallyProps {
  userData: Record<string, any>;
  email: string;
  title: string;
}

const Dashboard: React.FC<TallyProps> = () => {
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
      <div className="grid xl:grid-cols-3 p-2 lg:p-6 gap-6 overflow-y-auto border border-[#155E75] rounded-xl">
        <AmoliChart data={userAmoliData.records} userEmail={userEmail} />

        <TallyAdmin
          userData={userMoktobBisoyData}
          emails={userEmail}
          title="Moktob Bisoy Tally"
        />

        <TallyAdmin
          userData={userDawatiBisoyData}
          emails={userEmail}
          title="Dawati Bisoy Tally"
        />

        <TallyAdmin
          userData={userDawatiMojlishData}
          emails={userEmail}
          title="Dawati Mojlish Tally"
        />

        <TallyAdmin
          userData={userJamatBisoyData}
          emails={userEmail}
          title="Jamat Bisoy Tally"
        />

        <TallyAdmin
          userData={userDineFeraData}
          emails={userEmail}
          title="Dine Fireche Tally"
        />

        <TallyAdmin
          userData={userTalimBisoyData}
          emails={userEmail}
          title="Talim Bisoy Tally"
        />

        <TallyAdmin
          userData={userSoforBishoyData}
          emails={userEmail}
          title="Sofor Bisoy Tally"
        />

        <TallyAdmin
          userData={userDayeData}
          emails={userEmail}
          title="Dayee Bisoy Tally"
        />
      </div>

      <div className="border border-[#155E75] p-2 lg:p-6 mt-10 rounded-xl overflow-y-auto">
        <Tabs defaultValue="Amolimusahaba" className="w-full lg:p-4">
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
              <AmoliTableShow userData={userSoforBishoyData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Export dynamically to disable SSR
export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
