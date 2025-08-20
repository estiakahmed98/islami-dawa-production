"use client";

import React from "react";

interface TablePdfExporterProps {
  tableData: {
    headers: string[];
    rows: Array<Record<string, string | number>>;
    title?: string;
    description?: string;
  };
  fileName: string;
  buttonText?: string;
  buttonClassName?: string;
}

export const TablePdfExporter: React.FC<TablePdfExporterProps> = ({
  tableData,
  fileName,
  buttonText = "Download PDF",
  buttonClassName = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded",
}) => {
  const exportToPdf = async () => {
    if (typeof window === "undefined") return;

    // Create HTML structure for the PDF
    const html = `
            <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  @page {
                    size: landscape;
                    margin: 10mm;
                  }
                  body {
                    font-family: Arial, sans-serif;
                    padding: 4px;
                    margin: 0;
                    font-size: 10px;
                  }
                  .header {
                    margin-bottom: 10px;
                    text-align: left;
                  }
                  h1 {
                    color: #333;
                    font-size: 14px;
                    margin-bottom: 2px;
                  }
                  h2 {
                    color: #777;
                    font-size: 10px;
                    margin-top: 0;
                    margin-bottom: 10px;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9px;
                  }
                  th {
                    background-color: #f2f2f2;
                    text-align: left;
                    padding: 4px;
                    border: 1px solid #bbb;
                  }
                  td {
                    padding: 4px;
                    border: 1px solid #ccc;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>${tableData.title || "Report"}</h1>
                  ${tableData.description ? `<h2>${tableData.description}</h2>` : ""}
                </div>
                <table>
                  <thead>
                    <tr>
                      ${tableData.headers.map((header) => `<th>${header}</th>`).join("")}
                    </tr>
                  </thead>
                  <tbody>
                    ${tableData.rows
                      .map(
                        (row) => `
                          <tr>
                            ${tableData.headers.map((header) => `<td>${row[header] || ""}</td>`).join("")}
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </body>
            </html>
          `;

    // Create element and generate PDF
    const element = document.createElement("div");
    element.innerHTML = html;

    const opt = {
      margin: 10,
      filename: `${fileName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const html2pdf = (await import("html2pdf.js")).default as any;
    html2pdf().set(opt).from(element).save();
  };

  return (
    <button onClick={exportToPdf} className={buttonClassName}>
      {buttonText}
    </button>
  );
};
