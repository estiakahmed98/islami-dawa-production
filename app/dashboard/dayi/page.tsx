import DayeeBishoyForm from "@/components/DayeeBishoyForm";
import { userDayeData } from "@/app/data/dayiUserData";
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import AmoliTableShow from "@/components/TableShow";

const DayiPage: React.FC = () => {
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
            <div className=" bg-gray-50 lg:rounded lg:shadow">
              <DayeeBishoyForm />
            </div>
          </TabsContent>

          <TabsContent value="report">
            <div className=" bg-gray-50 rounded shadow">
              <AmoliTableShow userData={userDayeData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DayiPage;
