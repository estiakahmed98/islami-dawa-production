"use client"; //Juwel

import React, { useState, useEffect, useMemo } from "react";
import fileDownload from "js-file-download";
import "@fontsource/noto-sans-bengali";

interface AdminTableProps {
  userData: any;
  emailList: string[];
}

const AdminTable: React.FC<AdminTableProps> = ({ userData, emailList }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [transposedData, setTransposedData] = useState<any[]>([]);
  const [filterLabel, setFilterLabel] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

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
    if (!userData || !userData.records || !emailList.length) return;

    const labels = userData.labelMap;

    const transposed = Object.keys(labels).map((label) => {
      const row: { label: string; [key: number]: any } = {
        label: labels[label],
      };

      monthDays.forEach((day) => {
        const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        row[day] = emailList.reduce((sum, email) => {
          const value =
            parseFloat(userData.records[email]?.[date]?.[label]) || 0;
          return sum + value;
        }, 0);
      });

      return row;
    });

    setTransposedData(transposed);
  }, [selectedMonth, selectedYear, userData, emailList]);

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
    fileDownload(csvContent, "admin-table.csv");
  };

  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule; // Ensure correct function access
  };

  const convertToPDF = async () => {
    const monthName = months[selectedMonth];
    const year = selectedYear;

    if (
      !monthName ||
      !year ||
      !Array.isArray(transposedData) ||
      !Array.isArray(monthDays)
    ) {
      console.error("Invalid data for PDF generation");
      return;
    }

    // Filter out unwanted rows
    const filteredData = transposedData.filter((row) => row.label !== "মতামত");
    const filteredData2 = filteredData.filter((row) => row.label !== "Edit");

    // Create table structure
    let tableHTML = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap');
              body {
                font-family: 'Noto Sans Bengali', sans-serif;
                text-align: center;
                padding: 0px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              thead {
                display: table-header-group; /* Ensures header repeats on every page */
              }
              tbody {
                display: table-row-group;
              }
              tr {
                page-break-inside: avoid; /* Prevents rows from splitting */
              }
              td {
                border-bottom: 1px solid #000;
                padding: 8px;
                text-align: center;
                font-size: 12px;
              }
              th {
                background-color: #16A085;
                color: white;
                padding: 10px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <h2>${monthName} ${year}</h2>
            <table>
              <thead>
                <tr>
                  <th>দিন</th>
                  ${filteredData2.map((row) => `<th>${row.label}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${monthDays
                  .map(
                    (day) => `
                  <tr>
                    <td>${day}</td>
                    ${filteredData2
                      .map((row) => `<td>${row[day] || "-"}</td>`)
                      .join("")}
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

    const element = document.createElement("div");
    element.innerHTML = tableHTML;

    try {
      const html2pdf = await getHtml2Pdf(); // Load library dynamically
      console.log("html2pdf Loaded:", html2pdf); // Debugging

      if (typeof html2pdf !== "function") {
        console.error("html2pdf is not a function, received:", html2pdf);
        return;
      }

      html2pdf()
        .set({
          margin: 10,
          filename: `${monthName}_${year}_user_data.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(element)
        .toPdf()
        .get("pdf")
        .then(
          (pdf: {
            internal: {
              getNumberOfPages: () => any;
              pageSize: { getWidth: () => number; getHeight: () => number };
            };
            setPage: (arg0: number) => void;
            setFontSize: (arg0: number) => void;
            text: (arg0: string, arg1: number, arg2: number) => void;
          }) => {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              pdf.setFontSize(10);
              pdf.text(
                `Page ${i} of ${totalPages}`,
                pdf.internal.pageSize.getWidth() - 20,
                pdf.internal.pageSize.getHeight() - 10
              );
            }
          }
        )
        .save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl">
        {/* Dropdown Selectors */}
        <div className="flex items-center gap-4">
          {/* Month Selection Dropdown */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selection Dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4 lg:mt-0">
          <button
            className="flex items-center gap-2 text-sm lg:text-lg px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition duration-300"
            onClick={convertToCSV}
          >
            📥 Download CSV
          </button>
          <button
            className="flex items-center gap-2 text-sm lg:text-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300"
            onClick={convertToPDF}
          >
            📄 Download PDF
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
