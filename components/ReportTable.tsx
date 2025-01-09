import React, { useState, useEffect } from "react";
import fileDownload from "js-file-download";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { string } from "yup";

interface UserData {
  labelMap: { [key: string]: string }; // Maps labels to their display names.
  data?: {
    [email: string]: {
      [date: string]: {
        [label: string]: string | undefined;
      };
    };
  };
}

interface AmoliTableShowProps {
  userData: UserData;
}

const AmoliTableShow: React.FC<AmoliTableShowProps> = ({ userData }) => {
  const [monthDays, setMonthDays] = useState<number[]>([]);
  const [monthName, setMonthName] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [transposedData, setTransposedData] = useState<
    { label: string; [key: number]: string }[]
  >([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [editColumn, setEditColumn] = useState<number | null>(null);
  const [columnFormData, setColumnFormData] = useState<
    { label: string; value: string }[]
  >([]);
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

    const email = localStorage.getItem("userEmail") || "";
    setUserEmail(email);

    const labels = userData.labelMap;

    const transposed = Object.keys(labels).map((label) => {
      const row: { label: string; [key: number]: string } = {
        label: labels[label],
      };
      daysArray.forEach((day) => {
        const date = `${currentYear}-${(currentMonth + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        row[day] = userData[email]?.[date]?.[label] || "N/A";
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

  // PDF Export
  const convertToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${monthName} ${year} - User: ${userEmail}`, 14, 10);

    const headers = ["Label", ...monthDays.map((day) => `Day ${day}`)];
    const rows = transposedData.map((row) => [
      row.label,
      ...monthDays.map((day) => row[day]),
    ]);

    doc.autoTable({
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
      },
    });

    doc.save("amoli-table.pdf");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-2xl font-bold text-cyan-800 mb-4">
        {`User: ${userEmail} | Month: ${monthName} ${year}`}
      </h2>
      <div className="flex justify-end gap-4 mb-4">
        <button
          className="p-2 text-white border-2 bg-teal-700 rounded-md"
          onClick={convertToCSV}
        >
          Download CSV
        </button>
        <button
          className="p-2 text-white border-2 bg-teal-700 rounded-md"
          onClick={convertToPDF}
        >
          Download PDF
        </button>
      </div>
      <table className="table-auto border-collapse border border-gray-300 w-full text-sm md:text-base">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Label</th>
            {monthDays.map((day) => (
              <th
                key={day}
                className="border border-gray-300 px-6 py-2 text-center"
              >
                Day {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transposedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-100">
              <td className="border font-semibold border-gray-300 px-6 py-2">
                {row.label}
              </td>
              {monthDays.map((day) => (
                <td
                  key={day}
                  className="border border-gray-300 px-6 py-2 text-center"
                >
                  {row[day]}
                  <button
                    onClick={() => handleEditCellClick(rowIndex, day)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-blue-600"
                  >
                    ✏️
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

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
    </div>
  );
};

export default AmoliTableShow;
