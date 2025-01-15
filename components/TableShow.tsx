"use client";

import React, { useState, useEffect } from "react";
import fileDownload from "js-file-download";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSession } from "next-auth/react";

interface AmoliTableProps {
  userData: any;
}

const AmoliTableShow: React.FC<AmoliTableProps> = ({ userData }) => {
  const [monthDays, setMonthDays] = useState<number[]>([]);
  const [monthName, setMonthName] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [transposedData, setTransposedData] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [editColumn, setEditColumn] = useState<number | null>(null); // For column editing
  const [columnFormData, setColumnFormData] = useState<any[]>([]); // Data for column editing
  const [editCell, setEditCell] = useState<{
    rowIndex: number;
    day: number;
  } | null>(null); // For cell editing
  const [newCellValue, setNewCellValue] = useState<string>(""); // New cell value for editing

  const { data: session } = useSession();
  const email = session?.user?.email;

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

    // const email = localStorage.getItem("userEmail");
    // const email = "moni@gmail.com";

    setUserEmail(email || "");

    const labels = userData.labelMap;

    const transposed = Object.keys(labels).map((label) => {
      const row: { label: string; [key: number]: any } = {
        label: labels[label],
      };
      daysArray.forEach((day) => {
        const date = `${currentYear}-${(currentMonth + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        row[day] = email
          ? userData.records[email]?.[date]?.[label] || "- -"
          : "- -";
      });
      return row;
    });

    setTransposedData(transposed);
    setLoading(false);
  }, [userData]);

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

  // Column Editing Handlers
  const handleColumnEdit = (day: number) => {
    const columnData = transposedData.map((row) => ({
      label: row.label,
      value: row[day],
    }));
    setEditColumn(day);
    setColumnFormData(columnData);
  };

  const handleColumnInputChange = (index: number, newValue: string) => {
    setColumnFormData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value: newValue } : item))
    );
  };

  const handleSaveColumnEdit = () => {
    const updatedData = [...transposedData];
    columnFormData.forEach((item, index) => {
      updatedData[index][editColumn!] = item.value;
    });
    setTransposedData(updatedData);
    setEditColumn(null);
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
    // Validate Input Data
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

    // Initialize jsPDF
    const doc = new jsPDF();

    // Add Header Text
    doc.text(`${monthName} ${year} - User: ${userEmail}`, 14, 10);

    // Prepare Table Data
    const labels = transposedData.map((row) => row.label); // Extract labels for the table header row
    const headers = ["Day", ...labels]; // First column is 'Day', followed by all labels
    const rows = monthDays.map((day) => [
      `Day ${day}`, // First column contains the day label
      ...transposedData.map((row) => row[day] || "-"), // Add user data for each label and day
    ]);

    // Create the Table with autoTable
    autoTable(doc, {
      head: [headers], // Set table headers
      body: rows, // Set table rows
      startY: 20, // Vertical offset for the table
      theme: "striped", // Table theme
      headStyles: {
        fillColor: [22, 160, 133], // Header background color
        halign: "center", // Center-align header text
      },
      bodyStyles: {
        textColor: 50, // Text color for table body
      },
      styles: {
        halign: "center", // Center-align all text
        fontSize: 10, // Smaller font size for large tables
        cellWidth: "wrap", // Wrap text inside cells
      },
      margin: { top: 20 }, // Top margin for the table
      pageBreak: "auto", // Automatically handle page breaks
    });

    // Save the PDF File
    doc.save(`${monthName}_${year}_user_data.pdf`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="grid lg:flex  justify-between px-6 py-2">
        <h2 className="text-lg lg:text-2xl font-bold text-cyan-800 mb-4 flex items-center">
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
                  className="border border-gray-300 px-6 py-2 text-center relative group whitespace-nowrap"
                >
                  Day {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transposedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                <td className="border max-w-sm:text-xs font-normal border-gray-300 px-6 py-2 whitespace-nowrap">
                  {row.label}
                </td>
                {monthDays.map((day) => (
                  <td
                    key={day}
                    className="border border-gray-300 px-6 py-2 text-center relative group"
                  >
                    {row[day]}
                    <button
                      onClick={() => handleEditCellClick(rowIndex, day)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-blue-600"
                    >
                      ✏️
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="border border-gray-300 px-6 py-2 text-center font-bold"></td>
              {monthDays.map((day) => (
                <td
                  key={day}
                  className="border border-gray-300 px-6 py-2 text-center"
                >
                  <button
                    onClick={() => handleColumnEdit(day)}
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                  >
                    Edit
                  </button>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cell Edit Modal */}
      {editCell && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit Cell</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label: {transposedData[editCell.rowIndex]?.label}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day: {editCell.day}
              </label>
              <input
                type="text"
                className="border border-gray-300 p-2 w-full"
                value={newCellValue}
                onChange={(e) => setNewCellValue(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="p-2 bg-gray-300 rounded"
                onClick={handleCancelCellEdit}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-teal-700 text-white rounded"
                onClick={handleSaveCellEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Edit Modal */}
      {editColumn !== null && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-10 pr-20 rounded-xl shadow-lg w-2/5 max-h-[80vh] overflow-y-auto scrollbar">
            <h3 className="text-lg font-bold mb-4">
              Edit Column: Day {editColumn}
            </h3>
            {columnFormData.map((item, index) => (
              <div className="mb-4" key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {item.label}
                </label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full"
                  value={item.value || ""}
                  onChange={(e) =>
                    handleColumnInputChange(index, e.target.value)
                  }
                />
              </div>
            ))}
            <div className="flex justify-end gap-4">
              <button
                className="p-2 bg-gray-300 rounded"
                onClick={() => setEditColumn(null)}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-teal-700 text-white rounded"
                onClick={handleSaveColumnEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmoliTableShow;
