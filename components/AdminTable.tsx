// components/AdminTable.tsx
"use client"; // Juwel

import React, { useState, useEffect, useMemo } from "react";
import fileDownload from "js-file-download";
import "@fontsource/noto-sans-bengali";
import { useSelectedUser } from "@/providers/treeProvider";
import { useTranslations } from "next-intl";

interface AdminTableProps {
  userData: any;
  emailList: string[];
  // NEW: controlled month/year from parent
  selectedMonth?: number;
  selectedYear?: number;
  // NEW: which fields are clickable (e.g., ["assistantsList"])
  clickableFields?: string[];
  // NEW: bubble up clicks with dateKey + rowKey
  onCellClick?: (info: { dateKey: string; rowKey: string }) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({
  userData,
  emailList,
  selectedMonth: selectedMonthProp,
  selectedYear: selectedYearProp,
  clickableFields = [],
  onCellClick,
}) => {
  // if parent controls month/year, use props; else fallback to internal state
  const [internalMonth, setInternalMonth] = useState<number>(new Date().getMonth());
  const [internalYear, setInternalYear] = useState<number>(new Date().getFullYear());

  const selectedMonth = selectedMonthProp ?? internalMonth;
  const selectedYear = selectedYearProp ?? internalYear;

  const [transposedData, setTransposedData] = useState<any[]>([]);
  const [filterLabel, setFilterLabel] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

  const { selectedUser } = useSelectedUser();
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const month = useTranslations("dashboard.UserDashboard.months");
  const t = useTranslations("universalTableShow");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedUser) return;
      try {
        const response = await fetch(`/api/users?email=${encodeURIComponent(selectedUser)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch user");
        const u = await response.json();
        setSelectedUserData(u);
      } catch {
        setSelectedUserData(null);
      }
    };
    fetchUserDetails();
  }, [selectedUser]);

  const months = [
    month("january"), month("february"), month("march"), month("april"), month("may"), month("june"),
    month("july"), month("august"), month("september"), month("october"), month("november"), month("december"),
  ];

  const monthDays = useMemo(() => {
    return Array.from(
      { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
      (_, i) => i + 1
    );
  }, [selectedMonth, selectedYear]);

  const convertToPoints = (value: any, field: string): number => {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      const v = value.trim();
      if (field === "zikir") {
        if (v === "সকাল-সন্ধ্যা") return 2;
        if (v === "সকাল" || v === "সন্ধ্যা") return 1;
        return 0;
      }
      if (field === "ayat") {
        const [sStr, eStr] = v.split("-");
        const s = parseInt(sStr, 10);
        const e = parseInt(eStr ?? sStr, 10);
        const S = isNaN(s) ? 0 : s;
        const E = isNaN(e) ? S : e;
        return Math.max(0, Math.abs(E - S));
      }
      if (["surah", "ishraq", "ilm", "sirat"].includes(field)) return v ? 1 : 0;
      if (field === "jamat") {
        const n = Number(v) || 0;
        return n >= 1 && n <= 5 ? n : 0;
      }
      if (["Dua", "tasbih", "amoliSura", "hijbulBahar", "dayeeAmol", "ayamroja"].includes(field)) {
        return v === "হ্যাঁ" ? 1 : 0;
      }
      const n = parseFloat(v);
      if (!isNaN(n)) return n;
      return 0;
    }
    if (typeof value === "boolean") return value ? 1 : 0;
    return 0;
  };

  useEffect(() => {
    if (!userData || !userData.records || !emailList.length) return;

    const labelsMap: Record<string, string> = userData.labelMap || {};
    const labelKeys = Object.keys(labelsMap);

    const transposed = labelKeys.map((labelKey) => {
      const row: { labelKey: string; label: string;[key: number]: any } = {
        labelKey,
        label: labelsMap[labelKey],
      };

      monthDays.forEach((day) => {
        const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const sum = emailList.reduce((tot, email) => {
          const val = userData.records[email]?.[date]?.[labelKey];
          return tot + convertToPoints(val, labelKey);
        }, 0);
        row[day] = sum;
      });

      return row;
    });

    setTransposedData(transposed);
  }, [selectedMonth, selectedYear, userData, emailList, monthDays]);

  const filteredData = useMemo(() => {
    return transposedData.filter((row) => {
      const matchesLabel = filterLabel ? String(row.label).includes(filterLabel) : true;
      const matchesValue = filterValue
        ? Object.values(row).some((val) => typeof val !== "object" && String(val).includes(filterValue))
        : true;
      return matchesLabel && matchesValue;
    });
  }, [transposedData, filterLabel, filterValue]);

  const convertToCSV = () => {
    const BOM = "\uFEFF";
    const monthName = months[selectedMonth];
    const headers = [t("label"), ...monthDays.map((d) => `${d}`)];
    const rows = filteredData.map((row) => [row.label, ...monthDays.map((d) => row[d] ?? "-")]);
    const csv = BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const safeName = (selectedUserData?.name || "User").replace(/[\/\\:?*"<>|]/g, "_");
    const safeRole = (selectedUserData?.role || "Role").replace(/[\/\\:?*"<>|]/g, "_");
    fileDownload(csv, `report_${monthName}_${selectedYear}_${safeName}_${safeRole}.csv`);
  };

  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule;
  };

  const convertToPDF = async () => {
    const monthName = months[selectedMonth];

    const printableRows = transposedData
      .filter((row) => row.label !== "মতামত")
      .filter((row) => row.label !== "Edit");

    let tableHTML = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap');
            body { font-family: 'Noto Sans Bengali', sans-serif; padding: 0; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            th, td { border: 1px solid #000; padding: 8px; font-size: 12px; text-align: center; }
            th { background-color: #fff; color: #000; font-size: 14px; position: sticky; top: 0; z-index: 2; }
            .row-label { background-color: #fff; color: #000; font-weight: bold; text-align: left; padding-left: 10px; }
            .header-grid { font-size: 14px; display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 20px; }
          </style>
        </head>
        <body>
          <div class="header-grid">
            <div style="text-align: left;">
              <span>Name: ${selectedUserData?.name || "Name"}</span><br/>
              <span>Phone: ${selectedUserData?.phone || "Phone"}</span><br/>
              <span>Email: ${selectedUserData?.email || "Email"}</span><br/>
              <span>Role: ${selectedUserData?.role || "Role"}</span>
            </div>
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
              <span>${monthName} ${selectedYear} - ${selectedUserData?.name || ""}</span>
              <span>Markaz: ${selectedUserData?.markaz || "N/A"}</span>
            </div>
            <div style="text-align: right;">
              <span>Division: ${selectedUserData?.division || "N/A"}</span><br/>
              <span>District: ${selectedUserData?.district || "N/A"}</span><br/>
              <span>Upazila: ${selectedUserData?.upazila || "N/A"}</span><br/>
              <span>Union: ${selectedUserData?.union || "N/A"}</span><br/>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${monthName}</th>
                ${printableRows.map((row) => `<th>${row.label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${monthDays
        .map(
          (day) => `
                    <tr>
                      <td class="row-label">${day}</td>
                      ${printableRows.map((row) => `<td>${row[day] ?? "-"}</td>`).join("")}
                    </tr>
                  `
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
      const html2pdf = await getHtml2Pdf();
      html2pdf()
        .set({
          margin: 10,
          filename: `${monthName}_${selectedYear}_${(selectedUserData?.name || "User").replace(/[\/\\:?*"<>|]/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(element)
        .toPdf()
        .get("pdf")
        .then((pdf: any) => {
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

  const handleCellClick = (rowKey: string, day: number) => {
    if (!clickableFields.includes(rowKey)) return;
    const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onCellClick?.({ dateKey, rowKey });
  };

  return (
    <div>
      {/* if parent controls month/year, hide selectors; else show them */}
      {selectedMonthProp === undefined && selectedYearProp === undefined ? (
        <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl gap-4">
          <div className="flex items-center gap-4">
            <select
              value={internalMonth}
              onChange={(e) => setInternalMonth(parseInt(e.target.value))}
              className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>

            <select
              value={internalYear}
              onChange={(e) => setInternalYear(parseInt(e.target.value))}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {Array.from({ length: 10 }, (_, i) => 2020 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter label…"
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Filter value…"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="flex gap-4">
            <button className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md" onClick={convertToCSV}>
              📥 Download CSV
            </button>
            <button className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md" onClick={convertToPDF}>
              📄 Download PDF
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-auto">
        <table className="border-collapse border border-gray-300 w-full table-auto text-sm md:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">{t("label")}</th>
              {monthDays.map((day) => (
                <th key={day} className="border border-gray-300 px-6 py-2 text-center text-nowrap">
                  {t("day", { day })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-6 py-2 text-nowrap">{row.label}</td>
                {monthDays.map((day) => {
                  const clickable = clickableFields.includes(row.labelKey);
                  return (
                    <td
                      key={day}
                      className={`border border-gray-300 px-6 py-2 text-center ${clickable ? "cursor-pointer underline decoration-dotted" : ""}`}
                      onClick={() => handleCellClick(row.labelKey, day)}
                      title={clickable ? "Click to view details" : ""}
                    >
                      {row[day]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
