import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import SoforBishoyForm from "@/components/SoforBishoyForm";

const SoforPage: React.FC = () => {
  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div>
      <Tabs defaultValue="dataForm" className="w-full p-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="dataForm">তথ্য দিন</TabsTrigger>
            <TabsTrigger value="report">প্রতিবেদন</TabsTrigger>
          </TabsList>
          <div>
            <form className="border px-4 py-1 rounded-lg">
              <input type="date" defaultValue={currentDate}></input>
            </form>
          </div>
        </div>
        <TabsContent value="dataForm">
          <div className=" bg-gray-50 rounded shadow">
            <SoforBishoyForm />
          </div>
        </TabsContent>
        <TabsContent value="report">
          <div className=" bg-gray-50 rounded shadow">
            <Tabs defaultValue="monthly" className="w-full p-4">
              <div className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="monthly">মাসিক</TabsTrigger>
                  <TabsTrigger value="yearly">বাঁৎসরিক</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="monthly">
                <div>
                  {/* <ReportTable /> */}
                </div>
              </TabsContent>
              <TabsContent value="yearly">
                <div>
                  {/* <ReportTableYearly /> */}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SoforPage;
