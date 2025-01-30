"use client";
import React, { useState, useEffect } from "react";
import fileDownload from "js-file-download";

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
          const value =
            parseFloat(userData.records[email]?.[date]?.[label]) || 0;
          return sum + value;
        }, 0);
      });

      return row;
    });

    setTransposedData(mergedData);
    setLoading(false);
  }, [userData, emailList]);

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

 
  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule; // Ensure correct function access
  };

  const convertToPDF = async () => {
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
                margin-bottom: 20px;
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
        .then((pdf) => {
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
        })
        .save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
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
