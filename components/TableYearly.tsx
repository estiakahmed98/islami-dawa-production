
// "use client";
// import { TbXboxX } from "react-icons/tb";
// import React, { useState, useEffect, useMemo } from "react";
// import fileDownload from "js-file-download";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { useSession } from "next-auth/react";
// import DOMPurify from "dompurify";

// interface AmoliTableProps {
//   userData: any;
// }

// const AmoliTableShow: React.FC<AmoliTableProps> = ({ userData }) => {
//   const { data: session } = useSession();
//   const userEmail = session?.user?.email || "";

//   const [selectedMonth, setSelectedMonth] = useState<number>(
//     new Date().getMonth()
//   );
//   const [selectedYear, setSelectedYear] = useState<number>(
//     new Date().getFullYear()
//   );
//   const [transposedData, setTransposedData] = useState<any[]>([]);
//   const [motamotPopup, setMotamotPopup] = useState<string | null>(null);

//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const monthDays = useMemo(() => {
//     return Array.from(
//       { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
//       (_, i) => i + 1
//     );
//   }, [selectedMonth, selectedYear]);

//   useEffect(() => {
//     if (!userData || !userData.records || !userEmail) return;

//     const labels = userData.labelMap;
//     const transposed = Object.keys(labels).map((label) => {
//       const row: { label: string; [key: number]: any } = {
//         label: labels[label],
//       };

//       monthDays.forEach((day) => {
//         const date = `${selectedYear}-${(selectedMonth + 1)
//           .toString()
//           .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
//         const visitData =
//           userData.records[userEmail]?.[date]?.[label] ||
//           userData.records[userEmail]?.[date]?.[`${label}s`] ||
//           "- -";
//         row[day] = visitData;
//       });

//       return row;
//     });

//     // **মতামত row is NOT added**
//     setTransposedData(transposed);
//   }, [selectedMonth, selectedYear, userData, userEmail]);

//   // **PDF Export Function (Excluding মতামত)**
//   // PDF Export Function - Days in First Column
//   const convertToPDF = () => {
//     const monthName = months[selectedMonth];
//     const year = selectedYear;

//     if (
//       !monthName ||
//       !year ||
//       !userEmail ||
//       !Array.isArray(transposedData) ||
//       !Array.isArray(monthDays)
//     ) {
//       console.error("Invalid data for PDF generation");
//       return;
//     }

//     const doc = new jsPDF({ orientation: "landscape" });

//     doc.text(`${monthName} ${year} - User: ${userEmail}`, 14, 10);

//     // **Exclude মতামত row**
//     const filteredData = transposedData.filter((row) => row.label !== "মতামত");

//     // **Rearrange Data - Days as First Column**
//     const labels = filteredData.map((row) => row.label); // Extract labels for headers
//     const headers = ["Day", ...labels]; // First column is 'Day', followed by labels

//     // **Convert Data Structure**
//     const rows = monthDays.map((day) => [
//       `Day ${day}`, // First column contains the day label
//       ...filteredData.map((row) => row[day] || "-"), // Add user data for each label and day
//     ]);

//     autoTable(doc, {
//       head: [headers], // Set table headers
//       body: rows, // Set table rows
//       startY: 20, // Vertical offset for the table
//       theme: "striped", // Table theme
//       headStyles: {
//         fillColor: [22, 160, 133], // Header background color
//         halign: "center", // Center-align header text
//       },
//       bodyStyles: {
//         textColor: 50, // Text color for table body
//       },
//       styles: {
//         halign: "center", // Center-align all text
//         fontSize: 8, // Smaller font size for large tables
//         cellWidth: "auto", // Auto fit cells
//       },
//       columnStyles: {
//         0: { cellWidth: "wrap" }, // **Ensure No-Wrap for "Day" Column**
//       },
//       margin: { top: 20 }, // Top margin for the table
//       pageBreak: "auto", // Automatically handle page breaks
//     });

//     doc.save(`${monthName}_${year}_user_data.pdf`);
//   };

//   if (!userData || !userData.labelMap) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <div className="grid lg:flex justify-between py-4">
//         <div className="flex gap-4">
//           <select
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
//             className="border px-4 py-3 rounded"
//           >
//             {months.map((month, index) => (
//               <option key={index} value={index}>
//                 {month}
//               </option>
//             ))}
//           </select>

//           <select
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//             className="border px-4 py-3 rounded w-24"
//             style={{
//               maxHeight: "150px",
//               overflowY: "auto",
//             }}
//           >
//             {Array.from({ length: 101 }, (_, i) => 2000 + i).map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex gap-4">
//           <button
//             className="text-sm lg:text-lg p-2 text-white border-2 bg-teal-700 rounded-md"
//             onClick={convertToPDF}
//           >
//             Download PDF
//           </button>
//         </div>
//       </div>

//       <div className="overflow-auto">
//         <table className="border-collapse border border-gray-300 w-full table-auto text-sm md:text-base">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border border-gray-300 px-4 py-2">Label</th>
//               {monthDays.map((day) => (
//                 <th
//                   key={day}
//                   className="border border-gray-300 px-6 py-2 text-center text-nowrap"
//                 >
//                   Day {day}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {transposedData.map((row, rowIndex) => (
//               <tr key={rowIndex} className="hover:bg-gray-100">
//                 <td className="border border-gray-300 px-6 py-2 text-nowrap">
//                   {row.label}
//                 </td>
//                 {monthDays.map((day) => (
//                   <td
//                     key={day}
//                     className="border border-gray-300 px-6 py-2 text-center text-nowrap"
//                   >
//                     {row[day]}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AmoliTableShow;






"use client";
import { TbXboxX } from "react-icons/tb";
import React, { useState, useEffect, useMemo } from "react";
import fileDownload from "js-file-download";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSession } from "next-auth/react";
import DOMPurify from "dompurify";

interface AmoliTableProps {
  userData: any;
}

const AmoliTableShow: React.FC<AmoliTableProps> = ({ userData }) => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [transposedData, setTransposedData] = useState<any[]>([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthDays = useMemo(() => {
    return Array.from(
      { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
      (_, i) => i + 1
    );
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!userData || !userData.records || !userEmail) return;

    const labels = userData.labelMap;
    const transposed = Object.keys(labels).map((label) => {
      const row: { label: string; [key: number]: any } = {
        label: labels[label],
      };

      monthDays.forEach((day) => {
        const date = `${selectedYear}-${(selectedMonth + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        const visitData =
          userData.records[userEmail]?.[date]?.[label] ||
          userData.records[userEmail]?.[date]?.[`${label}s`] ||
          "- -";
        row[day] = visitData;
      });

      return row;
    });

    // **মতামত row is NOT added**
    setTransposedData(transposed);
  }, [selectedMonth, selectedYear, userData, userEmail]);

  // **CSV Export Function (Excludes মতামত)**
  const downloadCSV = () => {
    const monthName = months[selectedMonth];
    const year = selectedYear;

    if (!Array.isArray(transposedData) || !Array.isArray(monthDays)) {
      console.error("Invalid data for CSV generation");
      return;
    }

    // **Exclude মতামত row**
    const filteredData = transposedData.filter((row) => row.label !== "মতামত");

    // **Rearrange Data - Days as First Column**
    const headers = ["Day", ...filteredData.map((row) => row.label)];
    const rows = monthDays.map((day) => [
      `Day ${day}`,
      ...filteredData.map((row) => row[day] || "-"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    fileDownload(csvContent, `AmoliTable_${monthName}_${year}.csv`);
  };

  // **PDF Export Function (Excludes মতামত, Days in First Column)**
  const convertToPDF = () => {
    const monthName = months[selectedMonth];
    const year = selectedYear;

    if (
      !monthName ||
      !year ||
      !userEmail ||
      !Array.isArray(transposedData) ||
      !Array.isArray(monthDays)
    ) {
      console.error("Invalid data for PDF generation");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    doc.text(`${monthName} ${year} - User: ${userEmail}`, 14, 10);

    // **Exclude মতামত row**
    const filteredData = transposedData.filter((row) => row.label !== "মতামত");

    // **Rearrange Data - Days as First Column**
    const headers = ["Day", ...filteredData.map((row) => row.label)];
    const rows = monthDays.map((day) => [
      `Day ${day}`,
      ...filteredData.map((row) => row[day] || "-"),
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      theme: "striped",
      headStyles: {
        fillColor: [22, 160, 133],
        halign: "center",
      },
      bodyStyles: {
        textColor: 50,
      },
      styles: {
        halign: "center",
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 20 }, // **Ensure No-Wrap for "Day" Column (Fixed Width)**
      },
      margin: { top: 20 },
      pageBreak: "auto",
    });

    doc.save(`${monthName}_${year}_user_data.pdf`);
  };

  if (!userData || !userData.labelMap) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="grid lg:flex justify-between py-4">
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border px-4 py-3 rounded"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border px-4 py-3 rounded w-24"
            style={{
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {Array.from({ length: 101 }, (_, i) => 2000 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            className="text-sm lg:text-lg p-2 text-white border-2 bg-teal-700 rounded-md"
            onClick={downloadCSV}
          >
            Download CSV
          </button>
          <button
            className="text-sm lg:text-lg p-2 text-white border-2 bg-teal-700 rounded-md"
            onClick={convertToPDF}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="border-collapse border border-gray-300 w-full table-auto text-sm md:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Label</th>
              {monthDays.map((day) => (
                <th
                  key={day}
                  className="border border-gray-300 px-6 py-2 text-center text-nowrap"
                >
                  Day {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transposedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-6 py-2 text-nowrap">
                  {row.label}
                </td>
                {monthDays.map((day) => (
                  <td
                    key={day}
                    className="border border-gray-300 px-6 py-2 text-center text-nowrap"
                  >
                    {row[day]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmoliTableShow;
