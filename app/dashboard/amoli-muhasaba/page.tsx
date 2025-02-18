import AmoliMuhasabaForm from "@/components/AmoliMuhasabaForm";
import AmoliTableShow from "@/components/TableShow";
import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import React from "react";

const AmoliMuhasabaPage: React.FC = () => {
  return (
    <div>
      <div>
        <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="dataForm">তথ্য দিন</TabsTrigger>
              <TabsTrigger value="report">প্রতিবেদন</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dataForm">
            <div className="bg-gray-50 lg:rounded lg:shadow">
              <AmoliMuhasabaForm />
            </div>
          </TabsContent>

          <TabsContent value="report">
            <div className=" bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userAmoliData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AmoliMuhasabaPage;
