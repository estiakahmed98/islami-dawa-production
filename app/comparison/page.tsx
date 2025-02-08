// "use client";
// import React, { useState } from "react";
// import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
// import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
// import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
// import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
// import { userDineFeraData } from "@/app/data/dineferaUserData";
// import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
// import { userDayeData } from "@/app/data/dayiUserData";
// import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
// import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";
// import ComparisonModal from "@/components/ComparisonComponent";

// const dataSources = {
//   "Moktob Bisoy": userMoktobBisoyData?.records
//     ? userMoktobBisoyData
//     : { records: {} },
//   "Dawati Bisoy": userDawatiBisoyData?.records
//     ? userDawatiBisoyData
//     : { records: {} },
//   "Dawati Mojlish": userDawatiMojlishData?.records
//     ? userDawatiMojlishData
//     : { records: {} },
//   "Jamat Bisoy": userJamatBisoyData?.records
//     ? userJamatBisoyData
//     : { records: {} },
//   "Dine Fera": userDineFeraData?.records ? userDineFeraData : { records: {} },
//   "Sofor Bishoy": userSoforBishoyData?.records
//     ? userSoforBishoyData
//     : { records: {} },
//   Daye: userDayeData?.records ? userDayeData : { records: {} },
//   "Talim Bisoy": userTalimBisoyData?.records
//     ? userTalimBisoyData
//     : { records: {} },
//   "Amoli Muhasaba": userAmoliData?.records ? userAmoliData : { records: {} },
// };

// const types = Object.keys(dataSources);
// const months = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

// const getYears = () => {
//   const currentYear = new Date().getFullYear();
//   return Array.from({ length: 10 }, (_, i) => currentYear - i);
// };

// const ComparisonPage: React.FC = () => {
//   const years = getYears();
//   const [dataType, setDataType] = useState("");
//   const [fromMonth, setFromMonth] = useState("");
//   const [fromYear, setFromYear] = useState("");
//   const [toMonth, setToMonth] = useState("");
//   const [toYear, setToYear] = useState("");
//   const [filteredData, setFilteredData] = useState<any[]>([]);


//   return (
//     <div className="p-4 max-w-full mx-auto bg-white shadow rounded-lg">
//       <h1 className="text-xl font-bold mb-4">Comparison Page</h1>

//       <div className="mb-4">
//         <label className="block text-sm font-medium">Select Data Type</label>
//         <select
//           value={dataType}
//           onChange={(e) => {
//             setDataType(e.target.value);
//             console.log("Selected Data Type:", e.target.value);
//           }}
//           className="w-full p-2 border rounded"
//         >
//           <option value="">Select Type</option>
//           {Object.keys(dataSources).map((type) => (
//             <option key={type} value={type}>
//               {type}
//             </option>
//           ))}
//         </select>
//       </div>

//       {dataType && (
//         <div className="flex justify-between gap-4">
//           <div className="flex flex-col w-1/2">
//             <label className="block text-sm font-medium">From</label>
//             <select
//               value={fromMonth}
//               onChange={(e) => setFromMonth(e.target.value)}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">Select Month</option>
//               {months.map((month) => (
//                 <option key={month} value={month}>
//                   {month}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={fromYear}
//               onChange={(e) => setFromYear(e.target.value)}
//               className="w-full p-2 border rounded mt-2"
//             >
//               <option value="">Select Year</option>
//               {years.map((year) => (
//                 <option key={year} value={year}>
//                   {year}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <label className="block text-sm font-medium">To</label>
//             <select
//               value={toMonth}
//               onChange={(e) => setToMonth(e.target.value)}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">Select Month</option>
//               {months.map((month) => (
//                 <option key={month} value={month}>
//                   {month}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={toYear}
//               onChange={(e) => setToYear(e.target.value)}
//               className="w-full p-2 border rounded mt-2"
//             >
//               <option value="">Select Year</option>
//               {years.map((year) => (
//                 <option key={year} value={year}>
//                   {year}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       )}

//       <button
//         className="mt-4 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
//         disabled={!dataType || !fromMonth || !fromYear || !toMonth || !toYear}
//       >
//         Compare Data
//       </button>

//       <div>
//         <ComparisonModal isOpen={false} onClose={function (): void {
//           throw new Error("Function not implemented.");
//         } } onCompare={function (fromMonth: string, fromYear: string, toMonth: string, toYear: string): void {
//           throw new Error("Function not implemented.");
//         } } comparisonData={undefined} availableMonths={[]} availableYears={[]}/>
//       </div>

//     </div>
//   );
// };

// export default ComparisonPage;






"use client";
import React, { useState } from "react";
import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";
import TallyToCompare from "@/components/TallyToCompare";

const dataSources = {
  "Moktob Bisoy": userMoktobBisoyData ?? { records: {} },
  "Dawati Bisoy": userDawatiBisoyData ?? { records: {} },
  "Dawati Mojlish": userDawatiMojlishData ?? { records: {} },
  "Jamat Bisoy": userJamatBisoyData ?? { records: {} },
  "Dine Fera": userDineFeraData ?? { records: {} },
  "Sofor Bishoy": userSoforBishoyData ?? { records: {} },
  "Daye": userDayeData ?? { records: {} },
  "Talim Bisoy": userTalimBisoyData ?? { records: {} },
  "Amoli Muhasaba": userAmoliData ?? { records: {} },
};

const ComparisonPage: React.FC = () => {
  const [dataType, setDataType] = useState("");

  return (
    <div className="p-4 max-w-full mx-auto bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold mb-4">Comparison Page</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium">Select Data Type</label>
        <select
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Type</option>
          {Object.keys(dataSources).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {dataType && <TallyToCompare userData={dataSources[dataType]} title={dataType} />}
    </div>
  );
};

export default ComparisonPage;
