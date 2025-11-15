"use client"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import fileDownload from "js-file-download"
import { useSession } from "@/lib/auth-client"
import DOMPurify from "dompurify"
import "@fontsource/noto-sans-bengali"
import { EditRequestModal } from "./edit-request-modal"
import { createEditRequest, getEditRequestsByEmail } from "@/lib/edit-requests"
import { useTranslations } from "next-intl";
import UserTableShowPDFButton from "./UserTableShowPDFButton"

type EditStatus = "pending" | "approved" | "rejected"

interface EditRequestStatus {
  [date: string]: {
    status: EditStatus
    id?: string
    editedOnce?: boolean
  }
}

type Props = {
  userData: {
    // { [email]: { [YYYY-MM-DD]: { [rowKey]: value, editorContent?: string } } }
    records: Record<string, Record<string, any>>
    // { [rowKey]: "Label in Bangla/English" }
    labelMap: Record<string, string>
    // optional helpers (e.g., raw detail maps)
    [k: string]: any
  }
  selectedMonth: number
  selectedYear: number
  onMonthChange: (m: number) => void
  onYearChange: (y: number) => void
  // Optional enhancements:
  htmlFields?: string[] // row keys that should render with innerHTML (e.g., lists with <br/>)
  clickableFields?: string[] // row keys that are clickable
  onCellClick?: (info: { email: string; dateKey: string; rowKey: string }) => void
  // Optional PDF button for all categories
  categories?: { title: string; userData: any; selectedMonth: number; selectedYear: number }[]
  userEmail?: string
  userName?: string
}

const UniversalTableShow: React.FC<Props> = ({
  userData,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  htmlFields = [],
  clickableFields = [],
  onCellClick,
  categories,
  userEmail,
  userName,
}) => {
  const { data: session } = useSession()
  const finalUserEmail = userEmail || session?.user?.email || ""
  const finalUserName = userName || session?.user?.name || ""
  const user = session?.user || null

  const [transposedData, setTransposedData] = useState<any[]>([])
  const [motamotPopup, setMotamotPopup] = useState<string | null>(null)
  const [filterLabel, setFilterLabel] = useState<string>("")
  const [filterValue, setFilterValue] = useState<string>("")
  const [editPopup, setEditPopup] = useState<{ day: number; data: any } | null>(null)
  const [editRequestModal, setEditRequestModal] = useState<{ day: number } | null>(null)
  const [editRequestStatuses, setEditRequestStatuses] = useState<EditRequestStatus>({})
  const [tableData, setTableData] = useState<any>({})
  const month = useTranslations("dashboard.UserDashboard.months");
  const t = useTranslations("universalTableShow");

  const months = useMemo(
    () => [
      month("january"),
      month("february"),
      month("march"),
      month("april"),
      month("may"),
      month("june"),
      month("july"),
      month("august"),
      month("september"),
      month("october"),
      month("november"),
      month("december"),
    ],
    [],
  )

  // Ensure selectedMonth and selectedYear are valid numbers
  const safeSelectedMonth = Number.isInteger(selectedMonth) ? selectedMonth : new Date().getMonth();
  const safeSelectedYear = Number.isInteger(selectedYear) ? selectedYear : new Date().getFullYear();

  const monthDays = useMemo(() => {
    return Array.from(
      { length: new Date(safeSelectedYear, safeSelectedMonth + 1, 0).getDate() },
      (_, i) => i + 1
    )
  }, [safeSelectedMonth, safeSelectedYear])

  const isFutureDate = (day: number): boolean => {
    // Compare against *local* today to block future edits
    const now = new Date()
    const selected = new Date(selectedYear, selectedMonth, day, 23, 59, 59, 999)
    return selected > now
  }

  // Fetch edit-request statuses (by email)
  useEffect(() => {
    const fetchEditRequestStatuses = async () => {
      if (!finalUserEmail) return
      try {
        const requests = await getEditRequestsByEmail(finalUserEmail)
        const statuses: EditRequestStatus = {}
        requests.forEach((request: any) => {
          statuses[request.date] = {
            status: request.status,
            id: request.id,
            editedOnce: request.editedOnce || false,
          }
        })
        setEditRequestStatuses(statuses)
      } catch (error) {
        console.error(t("errorFetchingEditRequestStatuses"), error)
      }
    }
    fetchEditRequestStatuses()
  }, [finalUserEmail, selectedMonth, selectedYear])

  // Build table data
  useEffect(() => {
    if (!userData || !userData.records || !finalUserEmail) return

    setTableData(userData.records[finalUserEmail] || {})

    const labels = userData.labelMap || {}
    // rows by labelMap key order
    const transposed = Object.keys(labels).map((rowKey) => {
      const row: { label: string; key: string; [key: number]: any } = {
        label: labels[rowKey],
        key: rowKey, // keep stable key for field targeting
      }
      monthDays.forEach((day) => {
        const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        const cellValue = userData.records[finalUserEmail]?.[date]?.[rowKey] ?? "- -"
        row[day] = cellValue
      })
      return row
    })

    // কারগুজারী row (eye button)
    const motamotRow: { label: string; key: string; [key: number]: any } = {
      label: t("motamot"),
      key: "editorContent",
    }
    monthDays.forEach((day) => {
      const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const motamotHtml: string = userData.records[finalUserEmail]?.[date]?.editorContent || "- -"
      const motamotText = DOMPurify.sanitize(motamotHtml, { ALLOWED_TAGS: [] })
      motamotRow[day] =
        motamotText !== "- -" ? (
          <button onClick={() => setMotamotPopup(motamotText)} title="See note">
            👁️
          </button>
        ) : (
          "- -"
        )
    })
    transposed.push(motamotRow)

    // Edit row (buttons per day)
    const editRow: { label: string; key: string; [key: number]: any } = {
      label: t("edit"),
      key: "editActions",
    }
    monthDays.forEach((day) => {
      const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const requestStatus = editRequestStatuses[date]?.status
      const editedOnce = editRequestStatuses[date]?.editedOnce
      const isFuture = isFutureDate(day)

      if (isFuture) {
        editRow[day] = (
          <button
            className="text-sm bg-gray-300 text-white py-1 px-3 rounded cursor-not-allowed opacity-50"
            disabled
            title="Cannot request edit for future dates"
          >
            Unavailable
          </button>
        )
      } else if (requestStatus === "approved" && !editedOnce) {
        editRow[day] = (
          <button
            className="text-sm bg-green-600 text-white py-1 px-3 rounded"
            onClick={() => handleEditClick(day, transposed)}
          >
            {t("edit")}
          </button>
        )
      } else if (requestStatus === "approved" && editedOnce) {
        editRow[day] = (
          <button
            className="text-sm bg-gray-400 text-white py-1 px-3 rounded cursor-not-allowed"
            disabled
            title="Already edited once"
          >
            {t("edited")}
          </button>
        )
      } else if (requestStatus === "pending") {
        editRow[day] = (
          <button className="text-sm bg-yellow-500 text-white py-1 px-3 rounded cursor-not-allowed" disabled>
            {t("pending")}
          </button>
        )
      } else if (requestStatus === "rejected") {
        editRow[day] = (
          <button
            className="text-sm bg-gray-600 text-white py-1 px-3 rounded"
            onClick={() => setEditRequestModal({ day })}
          >
            {t("rejected")}
          </button>
        )
      } else {
        editRow[day] = (
          <button
            className="text-sm bg-rose-600 text-white py-1 px-3 rounded"
            onClick={() => setEditRequestModal({ day })}
          >
            {t("requestEdit")}
          </button>
        )
      }
    })
    transposed.push(editRow)

    setTransposedData(transposed)
  }, [selectedMonth, selectedYear, userData, finalUserEmail, editRequestStatuses, monthDays])

  // Filtering (optional UI left out; hooks kept)
  const filteredData = useMemo(() => {
    return transposedData.filter((row) => {
      const matchesLabel = filterLabel ? String(row.label).includes(filterLabel) : true
      const matchesValue = filterValue
        ? Object.values(row).some((val) => typeof val === "string" && val.includes(filterValue))
        : true
      return matchesLabel && matchesValue
    })
  }, [transposedData, filterLabel, filterValue])

  // CSV helpers (strip HTML safely)
  const stripHtmlForCSV = (val: any) => {
    if (typeof val !== "string") return val
    // convert <br> to " | ", drop other tags
    return val.replace(/<br\s*\/?>/gi, " | ").replace(/<[^>]*>/g, "")
  }

  const convertToCSV = () => {
    const BOM = "\uFEFF"
    const headers = [t("label"), ...monthDays.map((day) => `${t("day")} ${day}`)]
    const rows = filteredData.map((row) => [row.label, ...monthDays.map((day) => stripHtmlForCSV(row[day] ?? "-"))])
    const csvContent = BOM + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    const filename = `report_of_${session?.user?.name || "user"}.csv`
    fileDownload(csvContent, filename)
  }

  // PDF export (kept your existing layout)
  const getHtml2Pdf = async () => {
    const html2pdfModule = await import("html2pdf.js")
    return html2pdfModule.default || html2pdfModule
  }

  const convertToPDF = async () => {
    const monthName = months[selectedMonth]
    const year = selectedYear

    if (!monthName || !year || !finalUserEmail || !Array.isArray(transposedData)) {
      console.error(t("invalidDataForPDFGeneration"))
      return
    }

    // Exclude কারগুজারী & Edit rows from PDF
    const printableRows = transposedData.filter((row) => row.label !== t("motamot") && row.label !== t("edit"))

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
          thead { display: table-header-group; }
          tbody { display: table-row-group; }
          tr { page-break-inside: avoid; }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            font-size: 12px;
            text-align: center;
            vertical-align: top;
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
            <span>${monthName} ${year} - ${user?.name || ""}</span>
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
              ${printableRows.map((row) => `<th>${row.label}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${monthDays
              .map((day) => {
                const dayCells = printableRows
                  .map((row) => {
                    const val = row[day] ?? "-"
                    return `<td>${typeof val === "string" ? val : String(val)}</td>`
                  })
                  .join("")
                return `
                  <tr>
                    <td class="row-label">${t("day")} ${day}</td>
                    ${dayCells}
                  </tr>
                `
              })
              .join("")}
          </tbody>
        </table>
      </body>
    </html>`

    const element = document.createElement("div")
    element.innerHTML = tableHTML

    try {
      const html2pdf = await getHtml2Pdf()
      if (typeof html2pdf !== "function") {
        console.error("html2pdf is not a function, received:", html2pdf)
        return
      }

      html2pdf()
        .set({
          margin: 10,
          filename: `${user?.name || "user"} ${monthName}_${year}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(element)
        .toPdf()
        .get("pdf")
        .then((pdf: any) => {
          const totalPages = pdf.internal.getNumberOfPages()
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i)
            pdf.setFontSize(10)
            pdf.text(
              `Page ${i} of ${totalPages}`,
              pdf.internal.pageSize.getWidth() - 20,
              pdf.internal.pageSize.getHeight() - 10,
            )
          }
        })
        .save()
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  // Inline edit flow
  const handleEditClick = (day: number, currentTransposed: any[]) => {
    const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    if (editRequestStatuses[date]?.editedOnce) {
      alert(t("youCanOnlyEditDataOnceAfterApproval"))
      return
    }
    // All row values except last two (কারগুজারী + Edit actions)
    const dataToEdit = currentTransposed.slice(0, -2).map((row) => row[day])
    setEditPopup({ day, data: dataToEdit })
  }

  const handleSaveEdit = async (day: number, updatedData: any) => {
    const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

    if (editRequestStatuses[date]?.status !== "approved") {
      alert(t("youCanOnlyEditDataAfterYourRequestHasBeenApproved"))
      return
    }
    if (editRequestStatuses[date]?.editedOnce) {
      alert(t("youCanOnlyEditDataOnceAfterApproval"))
      return
    }

    try {
      const newData = [...transposedData]
      const updatedTableData = { ...tableData }
      if (!updatedTableData[date]) {
        updatedTableData[date] = {}
      }

      // Map by labelMap key order
      const rowKeys = Object.keys(userData.labelMap)
      rowKeys.forEach((rowKey, idx) => {
        if (idx < updatedData.length) {
          // Update transposedData visible cell
          if (newData[idx]) {
            newData[idx][day] = updatedData[idx]
          }
          // Update underlying table data (records)
          updatedTableData[date][rowKey] = updatedData[idx]
        }
      })

      setTransposedData(newData)
      setTableData(updatedTableData)

      // mark edited once
      setEditRequestStatuses((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          editedOnce: true,
        },
      }))

      setEditPopup(null)
      alert(t("dataUpdatedSuccessfullyYouCannotEditThisDateAgain"))
    } catch (error) {
      console.error("Error saving edit:", error)
      alert(t("failedToSaveEditsPleaseTryAgain"))
    }
  }

  const handleEditRequest = async (day: number, reason: string) => {
    if (!finalUserEmail || !user) return
    if (isFutureDate(day)) {
      alert(t("youCannotRequestEditsForFutureDates"))
      return
    }

    const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

    try {
      const newRequest = await createEditRequest({
        email: finalUserEmail,
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
      })

      setEditRequestStatuses((prev) => ({
        ...prev,
        [date]: {
          status: "pending",
          id: newRequest.id,
          editedOnce: false,
        },
      }))
      alert(t("editRequestSubmittedSuccessfullyPleaseWaitForAdminApproval"))
      setEditRequestModal(null)
    } catch (error) {
      console.error("Failed to create edit request:", error)
      alert(t("failedToSubmitEditRequestPleaseTryAgain"))
    }
  }

  // Helpers for cell rendering
  const dayToDateKey = (day: number) =>
    `${safeSelectedYear}-${String(safeSelectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={safeSelectedMonth}
              onChange={(e) => {
                const month = Number.parseInt(e.target.value, 10);
                if (!isNaN(month)) {
                  onMonthChange(month);
                }
              }}
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
              value={safeSelectedYear}
              onChange={(e) => {
                const year = Number.parseInt(e.target.value, 10);
                if (!isNaN(year)) {
                  onYearChange(year);
                }
              }}
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
          {/* <button
            className="flex items-center gap-2 text-xs lg:text-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300"
            onClick={convertToPDF}
          >
            📄 Download PDF
          </button> */}
          {categories && (
            <UserTableShowPDFButton
              categories={categories}
              userEmail={finalUserEmail}
              userName={finalUserName}
            />
          )}
        </div>
      </div>
      <div className="overflow-auto">
        <table className="border-collapse border border-gray-300 w-full table-auto text-sm md:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">{t("label")}</th>
              {monthDays.map((day) => (
                <th key={day} className="border border-gray-300 px-6 py-2 text-center text-nowrap">
                  {t("day")} {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-6 py-2 text-nowrap">{row.label}</td>
                {monthDays.map((day) => {
                  const value = row[day]
                  const rowKey = row.key || row.label // stable row key
                  const dateKey = dayToDateKey(day)
                  const shouldRenderHTML =
                    (htmlFields?.includes(rowKey) &&
                      typeof value === "string" &&
                      (value.includes("<br") || value.includes("</"))) ||
                    // fallback: render html if the content looks like html
                    (typeof value === "string" && (value.includes("<br") || value.includes("</")))
                  const clickable = clickableFields?.includes(rowKey)
                  const commonProps: any = {
                    className:
                      "border border-gray-300 px-6 py-2 text-center align-top " +
                      (clickable ? "cursor-pointer hover:bg-gray-50" : "text-nowrap"),
                    onClick:
                      clickable && onCellClick ? () => onCellClick({ email: finalUserEmail, dateKey, rowKey }) : undefined,
                  }
                  if (shouldRenderHTML) {
                    return (
                      <td
                        key={day} // Key passed directly
                        {...commonProps}
                        // allow line-breaks inside cell
                        style={{ whiteSpace: "normal" }}
                        dangerouslySetInnerHTML={{ __html: (value as string) || "" }}
                      />
                    )
                  }
                  return (
                    <td key={day} {...commonProps}>
                      {value ?? ""}
                    </td>
                  ) // Key passed directly
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* কারগুজারী popup */}
      {motamotPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-xl shadow-lg max-w-[85vw] lg:max-w-[60vw] max-h-[70vh] relative overflow-y-auto">
            <button
              className="absolute top-4 right-6 text-xl text-red-500 hover:text-red-700"
              onClick={() => setMotamotPopup(null)}
            >
              {t("close")}
            </button>
            <h3 className="text-lg font-bold mb-4">{t("motamot")}</h3>
            <p className="lg:text-xl">{motamotPopup}</p>
          </div>
        </div>
      )}
      {/* Inline edit popup */}
      {editPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-xl shadow-lg max-w-[85vw] lg:w-[50vw] max-h-[80vh] relative overflow-y-auto">
            <button
              className="absolute top-4 right-6 text-xl text-red-500 hover:text-red-700"
              onClick={() => setEditPopup(null)}
            >
              {t("close")}
            </button>
            <h3 className="text-lg font-bold mb-4">{t("editDataForDay")} {editPopup.day}</h3>
            <p className="text-amber-600 mb-4">{t("noteYouCanOnlyEditThisDataOnceAfterApproval")}</p>
            {editPopup.data.map((value: any, index: number) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{transposedData[index]?.label || ""}</label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded w-full"
                  value={typeof value === "string" ? value.replace(/<br\s*\/?>/gi, " | ") : value}
                  onChange={(e) => {
                    const updatedData = [...editPopup.data]
                    updatedData[index] = e.target.value
                    setEditPopup({ ...editPopup, data: updatedData })
                  }}
                />
              </div>
            ))}
            <div className="flex space-x-4 mt-4">
              <button
                className="text-sm bg-cyan-600 text-white py-2 px-4 rounded"
                onClick={() => handleSaveEdit(editPopup.day, editPopup.data)}
              >
                {t("save")}
              </button>
              <button
                className="text-sm bg-rose-500 text-white py-2 px-4 rounded hover:bg-rose-700"
                onClick={() => setEditPopup(null)}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit-request modal */}
      {editRequestModal && (
        <EditRequestModal
          day={editRequestModal.day}
          onSubmit={(reason) => handleEditRequest(editRequestModal.day, reason)}
          onCancel={() => setEditRequestModal(null)}
        />
      )}
    </div>
  )
}

export default UniversalTableShow
