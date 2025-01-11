import AmoliMuhasabaForm from "@/components/AmoliMuhasabaForm";
import DynamicTable from "@/components/ReportTable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import React from "react";

const AmoliMuhasabaPage: React.FC = () => {
  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div>
      <AmoliMuhasabaForm />
    </div>
    // <div>
    //   <AmoliMuhasabaForm />
    //   <Tabs defaultValue="dataForm" className="w-full p-4">
    //     <div className="flex justify-between">
    //       <TabsList>
    //         <TabsTrigger value="dataForm">তথ্য দিন</TabsTrigger>
    //         <TabsTrigger value="report">প্রতিবেদন</TabsTrigger>
    //       </TabsList>
    //       <div>
    //         <form className="border px-4 py-1 rounded-lg">
    //           <input type="date" defaultValue={currentDate}></input>
    //         </form>
    //       </div>
    //     </div>
    //     <TabsContent value="dataForm">
    //       <div className=" bg-gray-50 rounded shadow">
    //         <AmoliMuhasabaForm />
    //       </div>
    //     </TabsContent>
    //     <TabsContent value="report">
    //       <div className=" bg-gray-50 rounded shadow">
    //         <Tabs defaultValue="monthly" className="w-full p-4">
    //           <div className="flex justify-center">
    //             <TabsList>
    //               <TabsTrigger value="monthly">মাসিক</TabsTrigger>
    //               <TabsTrigger value="yearly">বাঁৎসরিক</TabsTrigger>
    //             </TabsList>
    //           </div>

    //           <TabsContent value="monthly">
    //             <div>
    //               {/* <ReportTable /> */}
    //               {/* <AmoliTableShow userData={userAmoliData} /> */}
    //             </div>
    //           </TabsContent>
    //           <TabsContent value="yearly">
    //             <div>{/* <ReportTableYearly /> */}</div>
    //           </TabsContent>
    //         </Tabs>
    //       </div>
    //     </TabsContent>
    //   </Tabs>
    // </div>
  );
};

export default AmoliMuhasabaPage;
