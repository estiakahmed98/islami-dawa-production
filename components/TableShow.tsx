"use client";

import React, { useState, useEffect, useMemo } from "react";
import fileDownload from "js-file-download";
import { useSession } from "@/lib/auth-client";
import DOMPurify from "dompurify";
import "@fontsource/noto-sans-bengali";
import { EditRequestModal } from "./edit-request-modal";
import { createEditRequest, getEditRequestsByEmail } from "@/lib/edit-requests";

interface AmoliTableProps {
  userData: any;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

interface EditRequestStatus {
  [date: string]: {
    status: "pending" | "approved" | "rejected";
    id?: string;
    editedOnce?: boolean;
  };
}

const UniversalTableShow: React.FC<AmoliTableProps> = ({ 
  userData, 
  selectedMonth, 
  selectedYear,
  onMonthChange,
  onYearChange
}) => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const user = session?.user || null;

  const [transposedData, setTransposedData] = useState<any[]>([]);
  const [motamotPopup, setMotamotPopup] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [editPopup, setEditPopup] = useState<{ day: number; data: any } | null>(null);
  const [editRequestModal, setEditRequestModal] = useState<{ day: number } | null>(null);
  const [editRequestStatuses, setEditRequestStatuses] = useState<EditRequestStatus>({});
  const [tableData, setTableData] = useState<any>({});

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthDays = useMemo(() => {
    return Array.from(
      { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
      (_, i) => i + 1
    );
  }, [selectedMonth, selectedYear]);

  const isFutureDate = (day: number): boolean => {
    const today = new Date();
    const selectedDate = new Date(selectedYear, selectedMonth, day);
    return selectedDate > today;
  };

  useEffect(() => {
    const fetchEditRequestStatuses = async () => {
      if (!userEmail) return;

      try {
        const requests = await getEditRequestsByEmail(userEmail);
        const statuses: EditRequestStatus = {};

        requests.forEach((request) => {
          statuses[request.date] = {
            status: request.status,
            id: request.id,
            editedOnce: request.editedOnce || false,
          };
        });

        setEditRequestStatuses(statuses);
      } catch (error) {
        console.error("Error fetching edit request statuses:", error);
      }
    };

    fetchEditRequestStatuses();
  }, [userEmail, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!userData || !userData.records || !userEmail) return;

    setTableData(userData.records[userEmail] || {});

    const labels = userData.labelMap;
    const transposed = Object.keys(labels).map((label) => {
      const row: { label: string; [key: number]: any } = {
        label: labels[label],
      };

      monthDays.forEach((day) => {
        const date = `${selectedYear}-${(selectedMonth + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        const visitData = userData.records[userEmail]?.[date]?.[label] || "- -";
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
      const motamotHtml = userData.records[userEmail]?.[date]?.editorContent || "- -";
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
      const date = `${selectedYear}-${(selectedMonth + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      const requestStatus = editRequestStatuses[date]?.status;
      const editedOnce = editRequestStatuses[date]?.editedOnce;
      const isFuture = isFutureDate(day);

      if (isFuture) {
        editRow[day] = (
          <button
            className="text-sm bg-gray-300 text-white py-1 px-3 rounded cursor-not-allowed opacity-50"
            disabled
            title="Cannot request edit for future dates"
          >
            Unavailable
          </button>
        );
      } else if (requestStatus === "approved" && !editedOnce) {
        editRow[day] = (
          <button
            className="text-sm bg-green-500 text-white py-1 px-3 rounded"
            onClick={() => handleEditClick(day, transposed)}
          >
            Edit
          </button>
        );
      } else if (requestStatus === "approved" && editedOnce) {
        editRow[day] = (
          <button
            className="text-sm bg-gray-400 text-white py-1 px-3 rounded cursor-not-allowed"
            disabled
            title="Already edited once"
          >
            Edited
          </button>
        );
      } else if (requestStatus === "pending") {
        editRow[day] = (
          <button
            className="text-sm bg-yellow-500 text-white py-1 px-3 rounded cursor-not-allowed"
            disabled
          >
            Pending
          </button>
        );
      } else if (requestStatus === "rejected") {
        editRow[day] = (
          <button
            className="text-sm bg-gray-500 text-white py-1 px-3 rounded"
            onClick={() => setEditRequestModal({ day })}
          >
            Rejected
          </button>
        );
      } else {
        editRow[day] = (
          <button
            className="text-sm bg-red-500 text-white py-1 px-3 rounded"
            onClick={() => setEditRequestModal({ day })}
          >
            Request Edit
          </button>
        );
      }
    });

    transposed.push(editRow);
    setTransposedData(transposed);
  }, [selectedMonth, selectedYear, userData, userEmail, editRequestStatuses]);

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
    const BOM = "\uFEFF";
    const headers = ["Label", ...monthDays.map((day) => `${day}`)];
    const rows = filteredData.map((row) => [
      row.label,
      ...monthDays.map((day) => row[day] || "-"),
    ]);
    const csvContent =
      BOM + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const filename = `report_of_${session?.user.name}.csv`;
    fileDownload(csvContent, filename);
  };

  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js");
    return html2pdfModule.default || html2pdfModule;
  };

  const convertToPDF = async () => {
    const monthName = months[selectedMonth];
    const year = selectedYear;

    if (!monthName || !year || !userEmail || !Array.isArray(transposedData)) {
      console.error("Invalid data for PDF generation");
      return;
    }

    const filteredData = transposedData.filter(
      (row) => row.label !== "মতামত" && row.label !== "Edit"
    );

    const tableHTML = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap');
            body {
              font-family: 'Noto Sans Bengali', sans-serif;
              padding: 0px;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            thead {
              display: table-header-group;
            }
            tbody {
              display: table-row-group;
            }
            tr {
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              font-size: 12px;
              text-align: center;
            }
            th {
              background-color: #ffffff;
              color: black;
              font-size: 14px;
              position: sticky;
              top: 0;
              z-index: 2;
            }
            .row-label {
              background-color: #ffffff;
              color: black;
              font-weight: bold;
              position: sticky;
              left: 0;
              z-index: 1;
              text-align: left;
              padding-left: 10px;
            }
          </style>
        </head>
        <body>
          <div style="font-size: 14px; display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 20px;">
            <div style="text-align: left;">
              <span>Name: ${user?.name || "Name"}</span><br>
              <span>Phone: ${user?.phone || "Phone"}</span><br>
              <span>Email: ${user?.email || "Email"}</span><br>
              <span>Role: ${user?.role || "Role"}</span>
            </div>

            <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
              <span>${monthName} ${year} - ${user?.name}</span>
              <span>Markaz: ${user?.markaz || "N/A"}</span>
            </div>

            <div style="text-align: right;">
              <span>Division: ${user?.division || "N/A"}</span><br>
              <span>District: ${user?.district || "N/A"}</span><br>
              <span>Upazila: ${user?.upazila || "N/A"}</span><br>
              <span>Union: ${user?.union || "N/A"}</span><br>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${monthName}</th>
                ${filteredData.map((row) => `<th>${row.label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${monthDays
                .map(
                  (day) => `
                <tr>
                  <td class="row-label">${day}</td>
                  ${filteredData.map((row) => `<td>${row[day] || "-"}</td>`).join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>`;

    const element = document.createElement("div");
    element.innerHTML = tableHTML;

    try {
      const html2pdf = await getHtml2Pdf();
      if (typeof html2pdf !== "function") {
        console.error("html2pdf is not a function, received:", html2pdf);
        return;
      }

      html2pdf()
        .set({
          margin: 10,
          filename: `${user?.name} ${monthName}_${year}.pdf`,
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

  const handleEditClick = (day: number, transposedData: any[]) => {
    const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    if (editRequestStatuses[date]?.editedOnce) {
      alert("You can only edit data once after approval");
      return;
    }

    const dataToEdit = transposedData.slice(0, -2).map((row) => row[day]);
    setEditPopup({ day, data: dataToEdit });
  };

  const handleSaveEdit = async (day: number, updatedData: any) => {
    const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    if (editRequestStatuses[date]?.status !== "approved") {
      alert("You can only edit data after your request has been approved");
      return;
    }

    if (editRequestStatuses[date]?.editedOnce) {
      alert("You can only edit data once after approval");
      return;
    }

    try {
      const newData = [...transposedData];
      const updatedTableData = { ...tableData };

      if (!updatedTableData[date]) {
        updatedTableData[date] = {};
      }

      Object.keys(userData.labelMap).forEach((label, index) => {
        if (index < updatedData.length) {
          if (newData[index]) {
            newData[index][day] = updatedData[index];
          }
          updatedTableData[date][label] = updatedData[index];
        }
      });

      setTransposedData(newData);
      setTableData(updatedTableData);

      setEditRequestStatuses((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          editedOnce: true,
        },
      }));

      setEditPopup(null);
      alert("Data updated successfully. You cannot edit this date again.");
    } catch (error) {
      console.error("Error saving edit:", error);
      alert("Failed to save edits. Please try again.");
    }
  };

  const handleEditRequest = async (day: number, reason: string) => {
    if (!userEmail || !user) return;

    if (isFutureDate(day)) {
      alert("You cannot request edits for future dates");
      return;
    }

    const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    try {
      const newRequest = await createEditRequest({
        email: userEmail,
        name: user.name || "",
        phone: user.phone || "",
        date,
        reason,
        location: {
          division: user.division || "",
          district: user.district || "",
          upazila: user.upazila || "",
          union: user.union || "",
        },
        role: user.role || "",
        status: "pending",
        editedOnce: false,
        createdAt: new Date().toISOString(),
      });

      setEditRequestStatuses((prev) => ({
        ...prev,
        [date]: {
          status: "pending",
          id: newRequest.id,
          editedOnce: false,
        },
      }));

      alert("Edit request submitted successfully. Please wait for admin approval.");
      setEditRequestModal(null);
    } catch (error) {
      console.error("Failed to create edit request:", error);
      alert("Failed to submit edit request. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number.parseInt(e.target.value))}
              className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
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

        <div className="flex gap-4 mt-4 lg:mt-0">
          <button
            className="flex items-center gap-2 text-xs lg:text-lg px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition duration-300"
            onClick={convertToCSV}
          >
            📥 Download CSV
          </button>
          <button
            className="flex items-center gap-2 text-xs lg:text-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300"
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
          <div className="bg-white p-10 rounded-xl shadow-lg max-w-[85vw] lg:max-w-[60vw] max-h-[70vh] relative overflow-y-auto">
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
          <div className="bg-white p-10 rounded-xl shadow-lg max-w-[85vw] lg:w-[50vw] max-h-[80vh] relative overflow-y-auto">
            <button
              className="absolute top-4 right-6 text-xl text-red-500 hover:text-red-700"
              onClick={() => setEditPopup(null)}
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-4">
              Edit Data for Day: {editPopup.day}
            </h3>
            <p className="text-amber-600 mb-4">
              Note: You can only edit this data once after approval.
            </p>
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

      {editRequestModal && (
        <EditRequestModal
          day={editRequestModal.day}
          onSubmit={(reason) => handleEditRequest(editRequestModal.day, reason)}
          onCancel={() => setEditRequestModal(null)}
        />
      )}
    </div>
  );
};

export default UniversalTableShow;