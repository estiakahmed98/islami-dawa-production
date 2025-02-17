"use client"; //Juwel

import React, { useState, useEffect, useMemo } from "react";
import fileDownload from "js-file-download";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSession } from "@/lib/auth-client";
import DOMPurify from "dompurify";

interface AmoliTableProps {
  userData: any;
}

const NewTable: React.FC<AmoliTableProps> = ({ userData }) => {
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
  const [filterLabel, setFilterLabel] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [editPopup, setEditPopup] = useState<{ day: number; data: any } | null>(
    null
  );

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

    const editRow: { label: string; [key: number]: any } = {
      label: "Edit",
    };
    monthDays.forEach((day) => {
      editRow[day] = (
        <button
          className="text-sm bg-blue-500 text-white py-1 px-3 rounded"
          onClick={() =>
            setEditPopup({
              day,
              data: transposed.slice(0, -2).map((row) => row[day]), // Exclude the last two rows (Motamot and Edit)
            })
          }
        >
          Edit
        </button>
      );
    });

    transposed.push(editRow);
    setTransposedData(transposed);
  }, [selectedMonth, selectedYear, userData, userEmail]);

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

    const filteredData = transposedData.filter((row) => row.label !== "মতামত");

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
        0: { cellWidth: 20 },
      },
      margin: { top: 20 },
      pageBreak: "auto",
    });

    doc.save(`${monthName}_${year}_user_data.pdf`);
  };

  const handleSaveEdit = (day: number, updatedData: any) => {
    const newData = [...transposedData];
    updatedData.forEach((value: any, index: number) => {
      if (newData[index]) {
        newData[index][day] = value;
      }
    });
    setTransposedData(newData);
    setEditPopup(null);
  };

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
      {editPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-xl shadow-lg max-w-[85vw] max-h-[80vh] relative overflow-y-auto">
            <button
              className="absolute top-4 right-6 text-xl text-red-500 hover:text-red-700"
              onClick={() => setEditPopup(null)}
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-4">
              Edit Data for Day: {editPopup.day}
            </h3>
            {editPopup.data.map((value: any, index: number) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {transposedData[index]?.label || ""}
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded w-full"
                  value={value}
                  onChange={(e) => {
                    const updatedData = [...editPopup.data];
                    updatedData[index] = e.target.value;
                    setEditPopup({ ...editPopup, data: updatedData });
                  }}
                />
              </div>
            ))}
            <div className="flex space-x-4 mt-4">
              <button
                className="text-sm bg-cyan-600 text-white py-2 px-4 rounded"
                onClick={() => handleSaveEdit(editPopup.day, editPopup.data)}
              >
                Save
              </button>
              <button
                className="text-sm bg-rose-500 text-white py-2 px-4 rounded hover:bg-rose-700"
                onClick={() => setEditPopup(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTable;
