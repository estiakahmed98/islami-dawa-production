// "use client";
// import React, { useState, useEffect } from "react";
// import AmoliChart from "@/components/AmoliChart";
// import TalimDonutChart from "@/components/TalimBisoyChart";
// import Tally from "@/components/Tally";

import OnItemClick from "@/components/MuiTreeView";

interface OnItemClickProps {
  loggedInUser: string;
  onItemClick: (user: string) => void;
}

// // Import data for Faysal and Jewel
// import { allData } from "@/app/data/data_faysal";

// import { useSelectedUser } from "@/providers/treeProvider";
// import ReportTable from "@/components/ReportTableMonthly";

// import { aggregateUserData } from "@/components/MergedFunction";
// import TallyDataTable from "@/components/TallyDataTable";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
// import FinalReportTable from "@/components/FinalReportTable";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/TabButton";
// import { userAmoliData } from "../data/amoliMuhasabaUserData";
// import { userMoktobBisoyData } from "../data/moktobBisoyUserData";
// import { userDawatiBisoyData } from "../data/dawatiBisoyUserData";
// import { userDawatiMojlishData } from "../data/dawatiMojlishUserData";
// import { userJamatBisoyUserData } from "../data/jamatBisoyUserData";
// import { userDineFeraData } from "../data/dineferaUserData";
// import { userSoforBisoyData } from "../data/userSoforBisoyData";
// import { userDayeData } from "../data/dayiUserData";
// import TallyAdmin from "@/components/TallyAdmin";

// // Types for Props and State
// interface DashboardData {
//   AmoliChartData?: any[];
//   TalimDonutChartData1?: any[];
//   TalimDonutChartData2?: any[];
// }

// const Dashboard = () => {
//   const { selectedUser } = useSelectedUser();
//   // const [emailList, setEmailList] = useState(selectedUser);
//   let emailList = selectedUser;
//   console.log("Email", emailList);

//   // const userEmail = localStorage.getItem("userEmail");
//   const userEmail =
//     typeof window !== "undefined"
//       ? localStorage.getItem("userEmail")
//       : "moni@gmail.com";

//   let dashboardData;

//   if (selectedUser === "rifat@gmail.com") {
//     emailList = [
//       "rifat@gmail.com",
//       "faysal@gmail.com",
//       "jewel@gmail.com",
//       "riyad@gmail.com",
//       "nazmul@gmail.com",
//     ];
//   } else if (selectedUser === "akash@gmail.com") {
//     emailList = [
//       "akash@gmail.com",
//       "ripon@gmail.com",
//       "sumon@gmail.com",
//       "taskin@gmail.com",
//       "shoriful@gmail.com",
//     ];
//   } else if (selectedUser === "toyon@gmail.com") {
//     emailList = [
//       "toyon@gmail.com",
//       "faysal@gmail.com",
//       "jewel@gmail.com",
//       "riyad@gmail.com",
//       "nazmul@gmail.com",
//       "ripon@gmail.com",
//       "sumon@gmail.com",
//       "taskin@gmail.com",
//       "shoriful@gmail.com",
//     ];
//   } else if (selectedUser === "zisan@gmail.com") {
//     emailList = ["zisan@gmail.com", "faysal@gmail.com", "jewel@gmail.com"];
//   } else if (selectedUser === "tauhid@gmail.com") {
//     emailList = ["tauhid@gmail.com", "riyad@gmail.com", "nazmul@gmail.com"];
//   } else if (selectedUser === "sadman@gmail.com") {
//     emailList = ["sadman@gmail.com", "ripon@gmail.com", "sumon@gmail.com"];
//   } else if (selectedUser === "saurav@gmail.com") {
//     emailList = ["saurav@gmail.com", "taskin@gmail.com", "shoriful@gmail.com"];
//   } else if (selectedUser === "taijul@gmail.com") {
//     emailList = ["taijul@gmail.com", "mehedi@gmail.com", "masum@gmail.com"];
//   } else if (selectedUser === "ripon@gmail.com") {
//     emailList = ["ripon@gmail.com", "amirul@gmail.com", "jahidul@gmail.com"];
//   } else if (selectedUser === "tamim@gmail.com") {
//     emailList = [
//       "tamim@gmail.com",
//       "mehedi@gmail.com",
//       "masum@gmail.com",
//       "amirul@gmail.com",
//       "jahidul@gmail.com",
//     ];
//   } else if (selectedUser === "aftab@gmail.com") {
//     emailList = ["aftab@gmail.com", "javed@gmail.com", "ashraful@gmail.com"];
//   } else if (selectedUser === "salek@gmail.com") {
//     emailList = ["salek@gmail.com", "mehmed@gmail.com", "osman@gmail.com"];
//   } else if (selectedUser === "hridoy@gmail.com") {
//     emailList = [
//       "hridoy@gmail.com",
//       "mehedi@gmail.com",
//       "masum@gmail.com",
//       "amirul@gmail.com",
//       "jahidul@gmail.com",
//       "javed@gmail.com",
//       "ashraful@gmail.com",
//       "mehmed@gmail.com",
//       "osman@gmail.com",
//     ];
//   } else if (selectedUser === "tanzid@gmail.com") {
//     emailList = [
//       "tanzid@gmail.com",
//       "javed@gmail.com",
//       "ashraful@gmail.com",
//       "mehmed@gmail.com",
//       "osman@gmail.com",
//     ];
//   } else if (selectedUser === "estiak@gmail.com") {
//     emailList = [
//       "estiak@gmail.com",
//       "faysal@gmail.com",
//       "jewel@gmail.com",
//       "riyad@gmail.com",
//       "nazmul@gmail.com",
//       "ripon@gmail.com",
//       "sumon@gmail.com",
//       "taskin@gmail.com",
//       "shoriful@gmail.com",
//       "mehedi@gmail.com",
//       "masum@gmail.com",
//       "amirul@gmail.com",
//       "jahidul@gmail.com",
//       "javed@gmail.com",
//       "ashraful@gmail.com",
//       "mehmed@gmail.com",
//       "osman@gmail.com",
//     ];
//   } else if (selectedUser === "shezaan@gmail.com") {
//     emailList = ["shezaan@gmail.com", "imad@gmail.com", "naim@gmail.com"];
//   } else if (selectedUser === "mughdo@gmail.com") {
//     emailList = ["mughdo@gmail.com", "sayeed@gmail.com", "sajeeb@gmail.com"];
//   } else if (selectedUser === "liton@gmail.com") {
//     emailList = [
//       "liton@gmail.com",
//       "imad@gmail.com",
//       "naim@gmail.com",
//       "sayeed@gmail.com",
//       "sajeeb@gmail.com",
//     ];
//   } else if (selectedUser === "mahfuz@gmail.com") {
//     emailList = ["mahfuz@gmail.com", "sarjees@gmail.com", "rafi@gmail.com"];
//   } else if (selectedUser === "asif@gmail.com") {
//     emailList = ["asif@gmail.com", "nahid@gmail.com", "hasnat@gmail.com"];
//   } else if (selectedUser === "shakil@gmail.com") {
//     emailList = [
//       "shakil@gmail.com",
//       "imad@gmail.com",
//       "naim@gmail.com",
//       "sayeed@gmail.com",
//       "sajeeb@gmail.com",
//       "sarjees@gmail.com",
//       "rafi@gmail.com",
//       "nahid@gmail.com",
//       "hasnat@gmail.com",
//     ];
//   } else if (selectedUser === "saif@gmail.com") {
//     emailList = [
//       "saif@gmail.com",
//       "sarjees@gmail.com",
//       "rafi@gmail.com",
//       "nahid@gmail.com",
//       "hasnat@gmail.com",
//     ];
//   } else if (selectedUser === "babor@gmail.com") {
//     emailList = ["babor@gmail.com", "rizwan@gmail.com", "shaheen@gmail.com"];
//   } else if (selectedUser === "nasim@gmail.com") {
//     emailList = ["nasim@gmail.com", "ameer@gmail.com", "hasnain@gmail.com"];
//   } else if (selectedUser === "raju@gmail.com") {
//     emailList = [
//       "raju@gmail.com",
//       "rizwan@gmail.com",
//       "shaheen@gmail.com",
//       "ameer@gmail.com",
//       "hasnain@gmail.com",
//     ];
//   } else if (selectedUser === "imran@gmail.com") {
//     emailList = ["imran@gmail.com", "rashid@gmail.com", "gurbaz@gmail.com"];
//   } else if (selectedUser === "faruque@gmail.com") {
//     emailList = [
//       "faruque@gmail.com",
//       "omarzai@gmail.com",
//       "nazibullah@gmail.com",
//     ];
//   } else if (selectedUser === "mezbah@gmail.com") {
//     emailList = [
//       "mezbah@gmail.com",
//       "rashid@gmail.com",
//       "gurbaz@gmail.com",
//       "omarzai@gmail.com",
//       "nazibullah@gmail.com",
//     ];
//   } else if (selectedUser === "pollob@gmail.com") {
//     emailList = [
//       "pollob@gmail.com",
//       "rashid@gmail.com",
//       "gurbaz@gmail.com",
//       "omarzai@gmail.com",
//       "nazibullah@gmail.com",
//       "rizwan@gmail.com",
//       "shaheen@gmail.com",
//       "ameer@gmail.com",
//       "hasnain@gmail.com",
//     ];
//   } else if (selectedUser === "ratul@gmail.com") {
//     emailList = [
//       "ratul@gmail.com",
//       "imad@gmail.com",
//       "naim@gmail.com",
//       "sayeed@gmail.com",
//       "sajeeb@gmail.com",
//       "sarjees@gmail.com",
//       "rafi@gmail.com",
//       "nahid@gmail.com",
//       "hasnat@gmail.com",
//       "rashid@gmail.com",
//       "gurbaz@gmail.com",
//       "omarzai@gmail.com",
//       "nazibullah@gmail.com",
//       "rizwan@gmail.com",
//       "shaheen@gmail.com",
//       "ameer@gmail.com",
//       "hasnain@gmail.com",
//     ];
//   } else if (selectedUser === "moni@gmail.com") {
//     emailList = [
//       "moni@gmail.com",
//       "faysal@gmail.com",
//       "jewel@gmail.com",
//       "riyad@gmail.com",
//       "nazmul@gmail.com",
//       "ripon@gmail.com",
//       "sumon@gmail.com",
//       "taskin@gmail.com",
//       "shoriful@gmail.com",
//       "mehedi@gmail.com",
//       "masum@gmail.com",
//       "amirul@gmail.com",
//       "jahidul@gmail.com",
//       "javed@gmail.com",
//       "ashraful@gmail.com",
//       "mehmed@gmail.com",
//       "osman@gmail.com",
//       "imad@gmail.com",
//       "naim@gmail.com",
//       "sayeed@gmail.com",
//       "sajeeb@gmail.com",
//       "sarjees@gmail.com",
//       "rafi@gmail.com",
//       "nahid@gmail.com",
//       "hasnat@gmail.com",
//       "rashid@gmail.com",
//       "gurbaz@gmail.com",
//       "omarzai@gmail.com",
//       "nazibullah@gmail.com",
//       "rizwan@gmail.com",
//       "shaheen@gmail.com",
//       "ameer@gmail.com",
//       "hasnain@gmail.com",
//     ];
//   } else if (!selectedUser) {
//     emailList = [userEmail];
//   } else {
//     emailList = [selectedUser];
//   }

//   return (
//     <div>
//       <div className="flex flex-col gap-4">
//         <div className="grow grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 pb-4 pt-2">
//           <>
//             {dashboardData ? (
//               <AmoliChart
//                 data={dashboardData?.AmoliChartData || []}
//                 innerRadius={70}
//                 outerRadius={115}
//                 startAngle={90}
//                 endAngle={450}
//               />
//             ) : (
//               <div className="flex justify-center items-center h-full shadow-lg rounded-lg">
//                 <p>No data available for the current user.</p>
//               </div>
//             )}

//             {dashboardData ? (
//               <TalimDonutChart
//                 data1={dashboardData?.TalimDonutChartData1 || []}
//                 data2={dashboardData?.TalimDonutChartData2 || []}
//                 innerRadius={50}
//                 outerRadius={90}
//                 startAngle={90}
//                 endAngle={450}
//               />
//             ) : (
//               <div className="flex justify-center items-center h-full shadow-lg rounded-lg">
//                 <p>No data available for the current user.</p>
//               </div>
//             )}
//           </>

//           <TallyAdmin
//             userData={userMoktobBisoyData}
//             emails={emailList}
//             title="Moktob Bisoy Tally Results"
//           />

//           <TallyAdmin
//             userData={userDawatiBisoyData}
//             emails={emailList}
//             title="Dawati Bisoy Tally"
//           />
//           <TallyAdmin
//             userData={userDawatiMojlishData}
//             emails={emailList}
//             title="Dawati Mojlish Tally"
//           />
//           <TallyAdmin
//             userData={userJamatBisoyUserData}
//             emails={emailList}
//             title="Jamat Bisoy Tally"
//           />
//           <TallyAdmin
//             userData={userDineFeraData}
//             emails={emailList}
//             title="Dine Fire Asa Tally"
//           />
//           <TallyAdmin
//             userData={userSoforBisoyData}
//             emails={emailList}
//             title="Sofor Bisoy Tally"
//           />
//           <TallyAdmin
//             userData={userDayeData}
//             emails={emailList}
//             title="Daye Bisoy Tally"
//           />
//         </div>
//       </div>

//       <div className="border border-[#155E75] overflow-y-auto">
//         <Tabs defaultValue="Amolimusahaba" className="w-full p-4">
//           <TabsList className="flex justify-between">
//             <TabsTrigger value="Amolimusahaba">Amolimusahaba</TabsTrigger>
//             <TabsTrigger value="moktob">Moktob Bisoy</TabsTrigger>
//             <TabsTrigger value="talim">Talim Bisoy</TabsTrigger>
//             <TabsTrigger value="daye">Daye Bisoy</TabsTrigger>
//             <TabsTrigger value="dawati">Dawati Bisoy</TabsTrigger>
//             <TabsTrigger value="dawatimojlish">Dawati Mojlish</TabsTrigger>
//             <TabsTrigger value="jamat">Jamat Bisoy</TabsTrigger>
//             <TabsTrigger value="dinefera">Dine Fire Asa</TabsTrigger>
//             <TabsTrigger value="sofor">Sofor Bisoy</TabsTrigger>
//           </TabsList>

//           {/* Tab Content */}
//           <TabsContent value="Amolimusahaba">
//             <div className="bg-gray-50 rounded shadow"></div>
//           </TabsContent>
//           <TabsContent value="moktob">
//             <div className="bg-gray-50 rounded shadow">
//               <div className="border">
//                 {/* <TallyDataTable tallyData={dashboardData.TallyData[0].data} /> */}
//               </div>
//             </div>
//           </TabsContent>
//           <TabsContent value="talim">
//             <div className="bg-gray-50 rounded shadow">
//               <FinalReportTable />
//             </div>
//           </TabsContent>
//           <TabsContent value="daye">
//             <div className="bg-gray-50 rounded shadow">
//               <FinalReportTable />
//             </div>
//           </TabsContent>
//           <TabsContent value="dawati">
//             <div className="bg-gray-50 rounded shadow">
//               <FinalReportTable />
//             </div>
//           </TabsContent>
//           <TabsContent value="dawatimojlish">
//             <div className="bg-gray-50 rounded shadow">
//               <FinalReportTable />
//             </div>
//           </TabsContent>
//           <TabsContent value="jamat">
//             <div className="bg-gray-50 rounded shadow">
//               <FinalReportTable />
//             </div>
//           </TabsContent>
//           <TabsContent value="dinefera">
//             <div className="bg-gray-50 rounded shadow">
//               <FinalReportTable />
//             </div>
//           </TabsContent>
//           <TabsContent value="sofor">
//             <div className="bg-gray-50 rounded shadow">
//               <FinalReportTable />
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
const navigateToUserPage = (user: string) => {
  console.log(`Navigating to user page for ${user}`);
};

const Page = () => {
  return (
    <div>
      It is admin dashboard
      <OnItemClick loggedInUser={"moni@gmail.com"} onItemClick={navigateToUserPage} />
    </div>
  );
};

export default Page;
