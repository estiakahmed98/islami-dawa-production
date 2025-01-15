
"use client";
import { TbXboxX } from "react-icons/tb";
import React, { useState, useEffect } from "react";
import fileDownload from "js-file-download";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSession } from "next-auth/react";

interface AmoliTableProps {
  userData: any;
  emailList: string[]; // Array of emails to aggregate data
}

const AdminTable: React.FC<AmoliTableProps> = ({ userData, emailList }) => {
  const [monthDays, setMonthDays] = useState<number[]>([]);
  const [monthName, setMonthName] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [transposedData, setTransposedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editColumn, setEditColumn] = useState<number | null>(null);
  const [columnFormData, setColumnFormData] = useState<any[]>([]);
  const [editCell, setEditCell] = useState<{
    rowIndex: number;
    day: number;
  } | null>(null);
  const [newCellValue, setNewCellValue] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Calculate total days in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    setMonthDays(daysArray);

    setMonthName(today.toLocaleString("default", { month: "long" }));
    setYear(currentYear);

    const labels = userData.labelMap;

    // Merge data for multiple emails
    const mergedData = Object.keys(labels).map((label) => {
      const row: { label: string; [key: number]: any } = {
        label: labels[label],
      };

      daysArray.forEach((day) => {
        const date = `${currentYear}-${(currentMonth + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        // Aggregate data for all emails
        row[day] = emailList.reduce((sum, email) => {
          const value = parseFloat(userData.records[email]?.[date]?.[label]) || 0;
          return sum + value;
        }, 0);
      });

      return row;
    });

    setTransposedData(mergedData);
    setLoading(false);
  }, [userData, emailList]);

  // Cell Editing Handlers
  const handleEditCellClick = (rowIndex: number, day: number) => {
    const currentValue = transposedData[rowIndex][day];
    setEditCell({ rowIndex, day });
    setNewCellValue(currentValue);
  };

  const handleSaveCellEdit = () => {
    if (editCell) {
      const updatedData = [...transposedData];
      updatedData[editCell.rowIndex][editCell.day] = newCellValue;
      setTransposedData(updatedData);
      setEditCell(null);
    }
  };

  const handleCancelCellEdit = () => {
    setEditCell(null);
  };

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
    const doc = new jsPDF();
    doc.text(`${monthName} ${year} - Aggregated Data`, 14, 10);

    const labels = transposedData.map((row) => row.label);
    const headers = ["Day", ...labels];
    const rows = monthDays.map((day) => [
      `Day ${day}`,
      ...transposedData.map((row) => row[day] || "-"),
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133], halign: "center" },
      bodyStyles: { textColor: 50 },
      styles: { halign: "center", fontSize: 10, cellWidth: "wrap" },
      margin: { top: 20 },
      pageBreak: "auto",
    });

    doc.save(`${monthName}_${year}_aggregated_data.pdf`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="grid lg:flex justify-between lg:px-6 py-2">
        <h2 className="text-lg lg:text-2xl font-bold text-cyan-800 mb-4">
          {`Month: ${monthName} ${year}`}
        </h2>
        <div className="flex gap-4 mb-4">
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
                  className="border border-gray-300 px-6 py-2 text-center whitespace-nowrap"
                >
                  Day {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transposedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-6 py-2 whitespace-nowrap">
                  {row.label}
                </td>
                {monthDays.map((day) => (
                  <td
                    key={day}
                    className="border border-gray-300 px-6 py-2 text-center"
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

export default AdminTable;
