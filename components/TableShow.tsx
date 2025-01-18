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
//   // const [monthDays, setMonthDays] = useState<number[]>([]);
//   const [monthName, setMonthName] = useState<string>("");
//   const [year, setYear] = useState<number>(new Date().getFullYear());
//   const [transposedData, setTransposedData] = useState<any[]>([]);
//   const [userEmail, setUserEmail] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(true);
//   const [editColumn, setEditColumn] = useState<number | null>(null); // For column editing
//   const [columnFormData, setColumnFormData] = useState<any[]>([]); // Data for column editing
//   const [editCell, setEditCell] = useState<{
//     rowIndex: number;
//     day: number;
//   } | null>(null); // For cell editing
//   const [newCellValue, setNewCellValue] = useState<string>(""); // New cell value for editing

//   const [motamotPopup, setMotamotPopup] = useState<string | null>(null);

//   const { data: session } = useSession();
//   const email = session?.user?.email;

//   const [selectedMonth, setSelectedMonth] = useState<number>(
//     new Date().getMonth()
//   );
//   const [selectedYear, setSelectedYear] = useState<number>(
//     new Date().getFullYear()
//   );

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
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth();

//     const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
//     const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

//     setMonthName(today.toLocaleString("default", { month: "long" }));
//     setYear(currentYear);
//     setUserEmail(email || "");

//     const labels = userData.labelMap;

//     const transposed = Object.keys(labels).map((label) => {
//       const row: { label: string; [key: number]: any } = {
//         label: labels[label],
//       };
//       daysArray.forEach((day) => {
//         const date = `${currentYear}-${(currentMonth + 1)
//           .toString()
//           .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
//         const visitData =
//           (email && userData.records[email]?.[date]?.[label]) ||
//           (email && userData.records[email]?.[date]?.[`${label}s`]) ||
//           "- -";
//         row[day] = visitData;
//       });
//       return row;
//     });

//     transposed.push({
//       label: "মতামত",
//       ...Object.fromEntries(
//         daysArray.map((day) => {
//           const date = `${currentYear}-${(currentMonth + 1)
//             .toString()
//             .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
//           const motamotHtml =
//             userData.records[email ?? ""]?.[date]?.editorContent || "- -";
//           const motamotText = DOMPurify.sanitize(motamotHtml, {
//             ALLOWED_TAGS: [],
//           });
//           return [
//             day,
//             motamotText !== "- -" ? (
//               <button onClick={() => setMotamotPopup(motamotText)}>👁️</button>
//             ) : (
//               "- -"
//             ),
//           ];
//         })
//       ),
//     });

//     setTransposedData(transposed);
//     setLoading(false);
//   }, [userData]);

//   // Cell Editing Handlers
//   const handleEditCellClick = (rowIndex: number, day: number) => {
//     const currentValue = transposedData[rowIndex][day];
//     setEditCell({ rowIndex, day });
//     setNewCellValue(currentValue);
//   };

//   const handleSaveCellEdit = () => {
//     if (editCell) {
//       const updatedData = [...transposedData];
//       updatedData[editCell.rowIndex][editCell.day] = newCellValue;
//       setTransposedData(updatedData);
//       setEditCell(null);
//     }
//   };

//   const handleCancelCellEdit = () => {
//     setEditCell(null);
//   };

//   // Column Editing Handlers
//   const handleColumnEdit = (day: number) => {
//     const columnData = transposedData.map((row) => ({
//       label: row.label,
//       value: row[day],
//     }));
//     setEditColumn(day);
//     setColumnFormData(columnData);
//   };

//   const handleColumnInputChange = (index: number, newValue: string) => {
//     setColumnFormData((prev) =>
//       prev.map((item, i) => (i === index ? { ...item, value: newValue } : item))
//     );
//   };

//   const handleSaveColumnEdit = () => {
//     const updatedData = [...transposedData];
//     columnFormData.forEach((item, index) => {
//       updatedData[index][editColumn!] = item.value;
//     });
//     setTransposedData(updatedData);
//     setEditColumn(null);
//   };

//   // CSV Export
//   const convertToCSV = () => {
//     const headers = ["Label", ...monthDays.map((day) => `Day ${day}`)];
//     const rows = transposedData.map((row) => [
//       row.label,
//       ...monthDays.map((day) => row[day]),
//     ]);
//     const csvContent = [
//       headers.join(","),
//       ...rows.map((row) => row.join(",")),
//     ].join("\n");
//     fileDownload(csvContent, "amoli-table.csv");
//   };

//   // PDF Export Function
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
//     const headers = ["Day", ...filteredData.map((row) => row.label)];
//     const rows = monthDays.map((day) => [
//       `Day ${day}`,
//       ...filteredData.map((row) => row[day] || "-"),
//     ]);

//     autoTable(doc, {
//       head: [headers],
//       body: rows,
//       startY: 20,
//       theme: "striped",
//       headStyles: {
//         fillColor: [22, 160, 133],
//         halign: "center",
//       },
//       bodyStyles: {
//         textColor: 50,
//       },
//       styles: {
//         halign: "center",
//         fontSize: 8,
//       },
//       columnStyles: {
//         0: { cellWidth: 20 }, // **Ensure No-Wrap for "Day" Column (Fixed Width)**
//       },
//       margin: { top: 20 },
//       pageBreak: "auto",
//     });

//     doc.save(`${monthName}_${year}_user_data.pdf`);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   function downloadCSV(event: React.MouseEvent<HTMLButtonElement>): void {
//     throw new Error("Function not implemented.");
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
//             onClick={downloadCSV}
//           >
//             Download CSV
//           </button>
//           <button
//             className="text-sm lg:text-lg p-2 text-white border-2 bg-teal-700 rounded-md"
//             onClick={convertToPDF}
//           >
//             Download PDF
//           </button>
//         </div>
//       </div>

//       <div>
//         <div className="overflow-auto">
//           <table className="border-collapse border border-gray-300 w-full table-auto text-sm md:text-base">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border border-gray-300 px-4 py-2">Label</th>
//                 {monthDays.map((day) => (
//                   <th
//                     key={day}
//                     className="border border-gray-300 px-6 py-2 text-center text-nowrap"
//                   >
//                     Day {day}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {transposedData.map((row, rowIndex) => (
//                 <tr key={rowIndex} className="hover:bg-gray-100">
//                   <td className="border border-gray-300 px-6 py-2 text-nowrap">
//                     {row.label}
//                   </td>
//                   {monthDays.map((day) => (
//                     <td
//                       key={day}
//                       className="border border-gray-300 px-6 py-2 text-center text-nowrap"
//                     >
//                       {row[day]}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {motamotPopup && (
//           <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
//             <div className="bg-white p-10 rounded-xl shadow-lg max-w-[80vw] lg:max-w-[60vw] max-h-[70vh] relative overflow-y-auto">
//               <button
//                 className="absolute top-4 right-6 text-xl text-red-500 hover:text-red-700"
//                 onClick={() => setMotamotPopup(null)}
//               >
//                 ✖
//               </button>
//               <h3 className="text-lg font-bold mb-4">মতামত</h3>
//               <p className="lg:text-xl">{motamotPopup}</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Cell Edit Modal */}
//       {editCell && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-96">
//             <h3 className="text-lg font-bold mb-4">Edit Cell</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Label: {transposedData[editCell.rowIndex]?.label}
//               </label>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Day: {editCell.day}
//               </label>
//               <input
//                 type="text"
//                 className="border border-gray-300 p-2 w-full"
//                 value={newCellValue}
//                 onChange={(e) => setNewCellValue(e.target.value)}
//               />
//             </div>
//             <div className="flex justify-end gap-4">
//               <button
//                 className="p-2 bg-gray-300 rounded"
//                 onClick={handleCancelCellEdit}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="p-2 bg-teal-700 text-white rounded"
//                 onClick={handleSaveCellEdit}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Column Edit Modal */}
//       {editColumn !== null && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-xl shadow-lg w-[90vw] lg:w-2/5 max-h-[80vh] mt-4 overflow-y-auto scrollbar relative">
//             <button
//               className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
//               onClick={() => setEditColumn(null)}
//             >
//               {/* &#x2715; */}
//               <TbXboxX className="size-8" />
//             </button>
//             <h3 className="text-lg font-bold mb-4">
//               Edit Column: Day {editColumn}
//             </h3>
//             {columnFormData.map((item, index) => (
//               <div className="mb-4" key={index}>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   {item.label}
//                 </label>
//                 <input
//                   type="text"
//                   className="border border-gray-300 p-2 w-full"
//                   value={item.value || ""}
//                   onChange={(e) =>
//                     handleColumnInputChange(index, e.target.value)
//                   }
//                 />
//               </div>
//             ))}
//             <div className="flex justify-end gap-4">
//               <button
//                 className="p-2 bg-gray-300 rounded"
//                 onClick={() => setEditColumn(null)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="p-2 bg-teal-700 text-white rounded"
//                 onClick={handleSaveColumnEdit}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
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
  const [motamotPopup, setMotamotPopup] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState<string>(""); // **Label Filter**
  const [filterValue, setFilterValue] = useState<string>(""); // **Value Search Filter**

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

    // **Add মতামত Row**
    const motamotRow: { label: string; [key: number]: any } = {
      label: "মতামত",
    };
    monthDays.forEach((day) => {
      const date = `${selectedYear}-${(selectedMonth + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      const motamotHtml =
        userData.records[userEmail]?.[date]?.editorContent || "- -";
      const motamotText = DOMPurify.sanitize(motamotHtml, {
        ALLOWED_TAGS: [],
      });

      motamotRow[day] =
        motamotText !== "- -" ? (
          <button onClick={() => setMotamotPopup(motamotText)}>👁️</button>
        ) : (
          "- -"
        );
    });

    transposed.push(motamotRow);
    setTransposedData(transposed);
  }, [selectedMonth, selectedYear, userData, userEmail]);

  // **Filter Logic**
  const filteredData = useMemo(() => {
    return transposedData.filter((row) => {
      const matchesLabel = filterLabel ? row.label.includes(filterLabel) : true;
      const matchesValue = filterValue
        ? Object.values(row).some(
            (val) => typeof val === "string" && val.includes(filterValue)
          )
        : true;
      return matchesLabel && matchesValue;
    });
  }, [transposedData, filterLabel, filterValue]);

  // CSV Export
  const convertToCSV = () => {
    const headers = ["Label", ...monthDays.map((day) => `Day ${day}`)];
    const rows = transposedData.map((row) => [
      row.label,
      ...monthDays.map((day) => row[day]),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    fileDownload(csvContent, "amoli-table.csv");
  };

  // PDF Export Function
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

  return (
    <div>
      <div className="grid lg:flex justify-between py-4">
        <div className="flex gap-4">
          {" "}
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
            onClick={convertToCSV}
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
            {filteredData.map((row, rowIndex) => (
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

      {motamotPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-xl shadow-lg max-w-[60vw] max-h-[70vh] relative overflow-y-auto">
            <button
              className="absolute top-4 right-6 text-xl text-red-500 hover:text-red-700"
              onClick={() => setMotamotPopup(null)}
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-4">মতামত</h3>
            <p className="lg:text-xl">{motamotPopup}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmoliTableShow;
