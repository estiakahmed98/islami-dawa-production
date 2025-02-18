import JamatBishoyForm from "@/components/JamatBishoyForm";
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import AmoliTableShow from "@/components/TableShow";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";

const JamatPage: React.FC = () => {
  return (
    <div>
      <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="dataForm">তথ্য দিন</TabsTrigger>
            <TabsTrigger value="report">প্রতিবেদন</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="dataForm">
          <div className=" bg-gray-50 lg:rounded lg:shadow">
            <JamatBishoyForm />
          </div>
        </TabsContent>

        <TabsContent value="report">
          <div className=" bg-gray-50 rounded shadow">
            <AmoliTableShow userData={userJamatBisoyData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JamatPage;
