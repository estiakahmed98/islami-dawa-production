import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export table data to CSV format
 * @param data - Transposed data array [{ label, 1: value1, 2: value2, ... }]
 * @param filename - Desired file name (without extension)
 */
export const exportToCSV = (data: any[], filename = "exported") => {
  const csvRows: string[] = [];

  // Header
  const headers = ["উপকরণ", ...Object.keys(data[0]).filter((key) => key !== "label")];
  csvRows.push(headers.join(","));

  // Data rows
  data.forEach((row) => {
    const values = [row.label, ...headers.slice(1).map((day) => `"${row[day] || ""}"`)];
    csvRows.push(values.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export table data to PDF format
 * @param data - Transposed data array
 * @param days - Array of day numbers for columns
 * @param title - Title of the PDF
 */
export const exportToPDF = (data: any[], days: number[], title = "Exported Table") => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(14);
  doc.text(title, 14, 15);

  const headers = ["উপকরণ", ...days.map((day) => day.toString())];

  const body = data.map((row) => {
    return [row.label, ...days.map((day) => row[day] || "-")];
  });

  autoTable(doc, {
    startY: 20,
    head: [headers],
    body,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save(`${title}.pdf`);
};
