// "use client";
// import React, { useState } from "react";
// import { useSession } from "@/lib/auth-client";

// import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
// import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
// import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
// import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
// import { userDineFeraData } from "@/app/data/dineferaUserData";
// import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
// import { userDayeData } from "@/app/data/dayiUserData";
// import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
// import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";

// const datasets = [
//   { name: "Amoli", data: userAmoliData },
//   { name: "Moktob Bisoy", data: userMoktobBisoyData },
//   { name: "Dawati Bisoy", data: userDawatiBisoyData },
//   { name: "Dawati Mojlish", data: userDawatiMojlishData },
//   { name: "Jamat Bisoy", data: userJamatBisoyData },
//   { name: "Dine Fera", data: userDineFeraData },
//   { name: "Sofor Bisoy", data: userSoforBishoyData },
//   { name: "Daye", data: userDayeData },
//   { name: "Talim Bisoy", data: userTalimBisoyData },
// ];

// const fetchComparisonData = (comparisonType: string, from: string, to: string) => {
//   return datasets.flatMap(({ data }) => {
//     if (!data.records) return [];

//     return Object.keys(data.labelMap).map((metric) => {
//       let totalFrom = 0;
//       let totalTo = 0;

//       Object.values(data.records).forEach((userRecords: any) => {
//         if (comparisonType === "day") {
//           totalFrom += Number(userRecords[from]?.[metric] || 0);
//           totalTo += Number(userRecords[to]?.[metric] || 0);
//         } else {
//           Object.keys(userRecords).forEach((date) => {
//             if (comparisonType === "month") {
//               if (date.startsWith(from)) totalFrom += Number(userRecords[date]?.[metric] || 0);
//               if (date.startsWith(to)) totalTo += Number(userRecords[date]?.[metric] || 0);
//             } else if (comparisonType === "year") {
//               if (date.startsWith(from)) totalFrom += Number(userRecords[date]?.[metric] || 0);
//               if (date.startsWith(to)) totalTo += Number(userRecords[date]?.[metric] || 0);
//             }
//           });
//         }
//       });

//       // ✅ **Fixed Percentage Change Calculation**
//       let change = "0%";
//       if (totalFrom === 0 && totalTo > 0) {
//         change = "∞% ↑"; // Infinity increase
//       } else if (totalFrom === 0 && totalTo === 0) {
//         change = "0%"; // No change
//       } else if (totalFrom > 0) {
//         const percentageChange = ((totalTo - totalFrom) / totalFrom) * 100;
//         change = `${percentageChange.toFixed(2)}% ${percentageChange > 0 ? "↑" : "↓"}`;
//       }

//       return {
//         label: data.labelMap[metric],
//         from: totalFrom,
//         to: totalTo,
//         change,
//       };
//     });
//   });
// };

// const generateYearOptions = () => {
//   const years = [];
//   for (let year = 2020; year <= 2100; year++) {
//     years.push(<option key={year} value={year}>{year}</option>);
//   }
//   return years;
// };

// const ComparisonPage: React.FC = () => {
//   const { data: session } = useSession();
//   const [comparisonType, setComparisonType] = useState("day");
//   const [from, setFrom] = useState(new Date().toISOString().split("T")[0]);
//   const [to, setTo] = useState(new Date().toISOString().split("T")[0]);
//   const [comparisonData, setComparisonData] = useState<any[]>([]);

//   const handleCompare = () => {
//     const data = fetchComparisonData(comparisonType, from, to);
//     setComparisonData(Array.isArray(data) ? data : []);
//   };

//   // ✅ Ensure "To" is always after "From"
//   const handleToChange = (value: string) => {
//     if (value < from) {
//       alert("The 'To' value must be later than the 'From' value.");
//       return;
//     }
//     setTo(value);
//   };

//   return (
//     <div className="p-6 bg-white shadow-md rounded-lg">
//       <h1 className="text-2xl font-bold text-gray-800 mb-4">Comparison Page</h1>
//       <div className="flex flex-wrap gap-4 mb-6">
//         <select
//           value={comparisonType}
//           onChange={(e) => {
//             setComparisonType(e.target.value);
//             setFrom("");
//             setTo("");
//           }}
//           className="border px-4 py-2 rounded-md shadow-sm"
//         >
//           <option value="day">Day-to-Day</option>
//           <option value="month">Month-to-Month</option>
//           <option value="year">Year-to-Year</option>
//         </select>

//         {comparisonType === "day" && (
//           <>
//             <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
//             <input type="date" value={to} onChange={(e) => handleToChange(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
//           </>
//         )}

//         {comparisonType === "month" && (
//           <>
//             <div className="flex gap-2">
//               <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
//               <span className="self-center font-bold">to</span>
//               <input type="month" value={to} onChange={(e) => handleToChange(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
//             </div>
//           </>
//         )}

//         {comparisonType === "year" && (
//           <>
//             <div className="flex gap-2">
//               <select value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm">
//                 {generateYearOptions()}
//               </select>
//               <span className="self-center font-bold">to</span>
//               <select value={to} onChange={(e) => handleToChange(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm">
//                 {generateYearOptions()}
//               </select>
//             </div>
//           </>
//         )}

//         <button onClick={handleCompare} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700">
//           Compare
//         </button>
//       </div>

//       <div className="bg-gray-100 p-4 rounded-lg shadow">
//         {comparisonData.length > 0 ? (
//           <table className="w-full border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border px-4 py-2">Label</th>
//                 <th className="border px-4 py-2">{from}</th>
//                 <th className="border px-4 py-2">{to}</th>
//                 <th className="border px-4 py-2">Change</th>
//               </tr>
//             </thead>
//             <tbody>
//               {comparisonData.map((item, index) => (
//                 <tr key={index} className="text-center">
//                   <td className="border px-4 py-2">{item.label}</td>
//                   <td className="border px-4 py-2">{item.from}</td>
//                   <td className="border px-4 py-2">{item.to}</td>
//                   <td className={`border px-4 py-2 font-bold ${item.change.includes("↑") ? "text-green-600" : "text-red-600"}`}>{item.change}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p>No comparison data available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ComparisonPage;










// "use client";
// import React, { useState } from "react";
// import { useSession } from "@/lib/auth-client";

// import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
// import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
// import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
// import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
// import { userDineFeraData } from "@/app/data/dineferaUserData";
// import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
// import { userDayeData } from "@/app/data/dayiUserData";
// import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
// import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";

// const datasets = [
//   { name: "Amoli", data: userAmoliData },
//   { name: "Moktob Bisoy", data: userMoktobBisoyData },
//   { name: "Dawati Bisoy", data: userDawatiBisoyData },
//   { name: "Dawati Mojlish", data: userDawatiMojlishData },
//   { name: "Jamat Bisoy", data: userJamatBisoyData },
//   { name: "Dine Fera", data: userDineFeraData },
//   { name: "Sofor Bisoy", data: userSoforBishoyData },
//   { name: "Daye", data: userDayeData },
//   { name: "Talim Bisoy", data: userTalimBisoyData },
// ];

// const fetchComparisonData = (comparisonType: string, from: string, to: string) => {
//   return datasets.flatMap(({ data }) => {
//     if (!data.records) return [];

//     return Object.keys(data.labelMap).map((metric) => {
//       let totalFrom = 0;
//       let totalTo = 0;

//       Object.values(data.records).forEach((userRecords: any) => {
//         if (comparisonType === "day") {
//           totalFrom += Number(userRecords[from]?.[metric] || 0);
//           totalTo += Number(userRecords[to]?.[metric] || 0);
//         } else {
//           Object.keys(userRecords).forEach((date) => {
//             if (comparisonType === "month") {
//               if (date.startsWith(from)) totalFrom += Number(userRecords[date]?.[metric] || 0);
//               if (date.startsWith(to)) totalTo += Number(userRecords[date]?.[metric] || 0);
//             } else if (comparisonType === "year") {
//               if (date.startsWith(from)) totalFrom += Number(userRecords[date]?.[metric] || 0);
//               if (date.startsWith(to)) totalTo += Number(userRecords[date]?.[metric] || 0);
//             }
//           });
//         }
//       });

//       let change = "0%";
//       if (totalFrom === 0 && totalTo > 0) {
//         change = "∞% ↑";
//       } else if (totalFrom === 0 && totalTo === 0) {
//         change = "0%";
//       } else if (totalFrom > 0) {
//         const percentageChange = ((totalTo - totalFrom) / totalFrom) * 100;
//         change = `${percentageChange.toFixed(2)}% ${percentageChange > 0 ? "↑" : "↓"}`;
//       }

//       return {
//         label: data.labelMap[metric],
//         from: totalFrom,
//         to: totalTo,
//         change,
//       };
//     });
//   });
// };

// const generateYearOptions = () => {
//   const years = [];
//   for (let year = 2020; year <= 2100; year++) {
//     years.push(<option key={year} value={year}>{year}</option>);
//   }
//   return years;
// };

// const ComparisonPage: React.FC = () => {
//   const { data: session } = useSession();

//   const [comparisonType, setComparisonType] = useState("day");
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [comparisonData, setComparisonData] = useState<any[]>([]);

//   const handleCompare = () => {
//     if (!from || !to) {
//       alert("Please select both 'From' and 'To' values.");
//       return;
//     }

//     const data = fetchComparisonData(comparisonType, from, to);
//     setComparisonData(Array.isArray(data) ? data : []);
//   };

//   return (
//     <div className="p-6 bg-white shadow-md rounded-lg">
//       <h1 className="text-2xl font-bold text-gray-800 mb-4">Comparison Page</h1>
//       <div className="flex flex-wrap gap-4 mb-6">
//         <select
//           value={comparisonType}
//           onChange={(e) => {
//             setComparisonType(e.target.value);
//             setFrom("");
//             setTo("");
//             setComparisonData([]); // Reset data on type change
//           }}
//           className="border px-4 py-2 rounded-md shadow-sm"
//         >
//           <option value="day">Day-to-Day</option>
//           <option value="month">Month-to-Month</option>
//           <option value="year">Year-to-Year</option>
//         </select>

//         {comparisonType === "day" && (
//           <>
//             <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
//             <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
//           </>
//         )}

//         {comparisonType === "month" && (
//           <>
//             <div className="flex gap-2">
//               <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
//               <span className="self-center font-bold">to</span>
//               <input type="month" value={to} onChange={(e) => setTo(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
//             </div>
//           </>
//         )}

//         {comparisonType === "year" && (
//           <>
//             <div className="flex gap-2">
//               <select value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm">
//                 {generateYearOptions()}
//               </select>
//               <span className="self-center font-bold">to</span>
//               <select value={to} onChange={(e) => setTo(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm">
//                 {generateYearOptions()}
//               </select>
//             </div>
//           </>
//         )}

//         <button onClick={handleCompare} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700">
//           Compare
//         </button>
//       </div>

//       <div className="bg-gray-100 p-4 rounded-lg shadow">
//         {comparisonData.length > 0 ? (
//           <table className="w-full border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border px-4 py-2">Label</th>
//                 <th className="border px-4 py-2">{from}</th>
//                 <th className="border px-4 py-2">{to}</th>
//                 <th className="border px-4 py-2">Change</th>
//               </tr>
//             </thead>
//             <tbody>
//               {comparisonData.map((item, index) => (
//                 <tr key={index} className="text-center">
//                   <td className="border px-4 py-2">{item.label}</td>
//                   <td className="border px-4 py-2">{item.from}</td>
//                   <td className="border px-4 py-2">{item.to}</td>
//                   <td className={`border px-4 py-2 font-bold ${item.change.includes("↑") ? "text-green-600" : "text-red-600"}`}>{item.change}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-center text-gray-600">Select values and click "Compare" to see results.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ComparisonPage;




















"use client";
import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";

import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";

const datasets = [
  { name: "Amoli", data: userAmoliData },
  { name: "Moktob Bisoy", data: userMoktobBisoyData },
  { name: "Dawati Bisoy", data: userDawatiBisoyData },
  { name: "Dawati Mojlish", data: userDawatiMojlishData },
  { name: "Jamat Bisoy", data: userJamatBisoyData },
  { name: "Dine Fera", data: userDineFeraData },
  { name: "Sofor Bisoy", data: userSoforBishoyData },
  { name: "Daye", data: userDayeData },
  { name: "Talim Bisoy", data: userTalimBisoyData },
];

const fetchComparisonData = (comparisonType: string, from: string, to: string) => {
  return datasets.flatMap(({ data }) => {
    if (!data.records) return [];

    return Object.keys(data.labelMap).map((metric) => {
      let totalFrom = 0;
      let totalTo = 0;

      Object.values(data.records).forEach((userRecords: any) => {
        if (comparisonType === "day") {
          totalFrom += Number(userRecords[from]?.[metric] || 0);
          totalTo += Number(userRecords[to]?.[metric] || 0);
        } else {
          Object.keys(userRecords).forEach((date) => {
            if (comparisonType === "month") {
              if (date.startsWith(from)) totalFrom += Number(userRecords[date]?.[metric] || 0);
              if (date.startsWith(to)) totalTo += Number(userRecords[date]?.[metric] || 0);
            } else if (comparisonType === "year") {
              if (date.startsWith(from)) totalFrom += Number(userRecords[date]?.[metric] || 0);
              if (date.startsWith(to)) totalTo += Number(userRecords[date]?.[metric] || 0);
            }
          });
        }
      });

      let change = "0%";
      if (totalFrom === 0 && totalTo > 0) {
        change = "∞% ↑"; // Infinite increase
      } else if (totalFrom > 0 && totalTo === 0) {
        change = "-∞% ↓"; // Infinite decrease
      } else if (totalFrom === totalTo) {
        change = "0%";
      } else {
        let percentageChange;
        if((totalTo - totalFrom) > 0){
          percentageChange = ((Math.max(totalTo,totalFrom) - Math.min(totalTo,totalFrom)) / Math.min(totalTo,totalFrom)) * 100;
        }
        else {
          percentageChange = - ((Math.max(totalTo,totalFrom) - Math.min(totalTo,totalFrom)) / Math.min(totalTo,totalFrom)) * 100;

        }

        change = `${percentageChange.toFixed(2)}% ${percentageChange > 0 ? "↑" : "↓"}`;
      }

      return {
        label: data.labelMap[metric],
        from: totalFrom,
        to: totalTo,
        change,
        isIncrease: change.includes("↑"), // True if increase
      };
    });
  });
};

const generateYearOptions = () => {
  const years = [];
  for (let year = 2020; year <= 2100; year++) {
    years.push(<option key={year} value={year}>{year}</option>);
  }
  return years;
};

const ComparisonPage: React.FC = () => {
  const { data: session } = useSession();

  const [comparisonType, setComparisonType] = useState("day");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  const handleCompare = () => {
    if (!from || !to) {
      alert("Please select both 'From' and 'To' values.");
      return;
    }

    const data = fetchComparisonData(comparisonType, from, to);
    setComparisonData(Array.isArray(data) ? data : []);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Comparison Page</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={comparisonType}
          onChange={(e) => {
            setComparisonType(e.target.value);
            setFrom("");
            setTo("");
            setComparisonData([]); // Reset data on type change
          }}
          className="border px-4 py-2 rounded-md shadow-sm"
        >
          <option value="day">Day-to-Day</option>
          <option value="month">Month-to-Month</option>
          <option value="year">Year-to-Year</option>
        </select>

        {comparisonType === "day" && (
          <>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
          </>
        )}

        {comparisonType === "month" && (
          <>
            <div className="flex gap-2">
              <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
              <span className="self-center font-bold">to</span>
              <input type="month" value={to} onChange={(e) => setTo(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm" />
            </div>
          </>
        )}

        {comparisonType === "year" && (
          <>
            <div className="flex gap-2">
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm">
                {generateYearOptions()}
              </select>
              <span className="self-center font-bold">to</span>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="border px-4 py-2 rounded-md shadow-sm">
                {generateYearOptions()}
              </select>
            </div>
          </>
        )}

        <button onClick={handleCompare} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700">
          Compare
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow">
        {comparisonData.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Label</th>
                <th className="border px-4 py-2">{from}</th>
                <th className="border px-4 py-2">{to}</th>
                <th className="border px-4 py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{item.label}</td>
                  <td className="border px-4 py-2">{item.from}</td>
                  <td className="border px-4 py-2">{item.to}</td>
                  <td className={`border px-4 py-2 font-bold ${item.isIncrease ? "text-green-600" : "text-red-600"}`}>{item.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">Select values and click "Compare" to see results.</p>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;











