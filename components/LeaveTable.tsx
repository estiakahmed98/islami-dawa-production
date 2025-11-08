"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSession } from "@/lib/auth-client" // Assuming this hook exists
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LeaveForm from "./LeaveForm" // Assuming LeaveForm exists and handles form submission/editing
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import type { LeaveRecord } from "@/lib/types"

const LeaveTable: React.FC = () => {
  const { data: session } = useSession()
  const userEmail = session?.user?.email || ""
  const userName = session?.user?.name || ""

  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null)
  const [showForm, setShowForm] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (userEmail) fetchLeaves()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail])

  /** Helpers */
  const toISODate = (d: string | Date) => {
    const dd = new Date(d)
    return dd.toISOString()
  }

  const titleCaseStatus = (s: string) => {
    const v = (s || "").toLowerCase()
    if (v === "approved") return "Approved"
    if (v === "rejected") return "Rejected"
    return "Pending"
  }

  const statusClass = (s: string) => {
    const v = (s || "").toLowerCase()
    if (v === "approved") return "bg-green-100 text-green-800"
    if (v === "rejected") return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  /** Fetch from Prisma-backed API */
  const fetchLeaves = async () => {
    if (!userEmail) return
    try {
      const res = await fetch(`/api/leaves?email=${encodeURIComponent(userEmail)}`)
      if (!res.ok) return
      const data = await res.json()
      const mapped: LeaveRecord[] = (data?.leaveRequests ?? []).map((lr: any) => ({
        id: lr.id,
        leaveType: lr.leaveType,
        from: toISODate(lr.fromDate),
        to: toISODate(lr.toDate),
        days: lr.days,
        reason: lr.reason,
        approvedBy: lr.approvedBy,
        status: titleCaseStatus(lr.status),
        phone: lr.phone ?? "",
        name: lr.name ?? "",
      }))
      mapped.sort((a: any, b: any) => (a.from > b.from ? -1 : 1))
      setLeaves(mapped)
    } catch (e) {
      console.error("Error fetching leaves:", e)
    }
  }

  const handleEdit = (leave: LeaveRecord) => {
    setSelectedLeave(leave)
    setShowForm(true)
  }

  const handleDownloadAll = async () => {
    if (!pdfRef.current) return
    const html2pdf = (await import("html2pdf.js")).default
    const element = pdfRef.current.cloneNode(true) as HTMLElement

    const container = document.createElement("div")
    container.style.padding = "30px"
    container.style.fontFamily = "Arial, sans-serif"

    const header = document.createElement("div")
    header.style.marginBottom = "20px"
    header.style.borderBottom = "2px solid #E2E8F0"
    header.style.paddingBottom = "15px"

    const title = document.createElement("h1")
    title.textContent = "Leave Records"
    title.style.textAlign = "center"
    title.style.marginBottom = "10px"
    title.style.color = "#2C5282"

    const userInfo = document.createElement("div")
    userInfo.innerHTML = `
      <p style="text-align: center; margin: 5px 0; color: #4A5568;"><strong>Name:</strong> ${userName}</p>
      <p style="text-align: center; margin: 5px 0; color: #4A5568;"><strong>Email:</strong> ${userEmail}</p>
      <p style="text-align: center; margin: 5px 0; color: #4A5568;"><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
    `
    header.appendChild(title)
    header.appendChild(userInfo)
    container.appendChild(header)

    const table = element.querySelector("table")
    if (table) {
      table.style.width = "100%"
      table.style.borderCollapse = "collapse"
      table.style.fontSize = "12px"

      const headers = table.querySelectorAll("th")
      headers.forEach((h) => {
        ;(h as HTMLElement).style.backgroundColor = "#4299E1"
        ;(h as HTMLElement).style.color = "white"
        ;(h as HTMLElement).style.padding = "10px"
        ;(h as HTMLElement).style.textAlign = "left"
        ;(h as HTMLElement).style.border = "1px solid #E2E8F0"
      })

      const cells = table.querySelectorAll("td")
      cells.forEach((c) => {
        ;(c as HTMLElement).style.padding = "8px"
        ;(c as HTMLElement).style.border = "1px solid #E2E8F0"
      })

      const statusCells = table.querySelectorAll("td:nth-child(7)")
      statusCells.forEach((cell) => {
        const status = cell.textContent?.trim()
        cell.innerHTML = ""
        const badge = document.createElement("span")
        badge.textContent = status || ""
        badge.style.padding = "4px 8px"
        badge.style.borderRadius = "4px"
        badge.style.fontWeight = "600"

        const v = (status || "").toLowerCase()
        if (v === "pending") {
          badge.style.backgroundColor = "#FEF3C7"
          badge.style.color = "#92400E"
        } else if (v === "approved") {
          badge.style.backgroundColor = "#D1FAE5"
          badge.style.color = "#065F46"
        } else if (v === "rejected") {
          badge.style.backgroundColor = "#FEE2E2"
          badge.style.color = "#991B1B"
        }
        cell.appendChild(badge)
        ;(cell as HTMLElement).style.textAlign = "center"
      })

      const actionColumns = table.querySelectorAll("th:last-child")
      actionColumns.forEach((col) => col.remove())

      const actionCells = table.querySelectorAll("td:last-child")
      actionCells.forEach((cell) => cell.remove())
    }

    html2pdf()
      .set({ pagebreak: { mode: ["css", "legacy"] } })
      .from(container)
      .save()
  }

  const handleDownloadSingleLeave = async (leave: LeaveRecord) => {
    const html2pdf = (await import("html2pdf.js")).default
    const container = document.createElement("div")
    container.style.padding = "40px"
    container.style.fontFamily = "Arial, sans-serif"
    container.style.maxWidth = "800px"
    container.style.margin = "0 auto"

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      } catch {
        return dateString
      }
    }

    const v = leave.status.toLowerCase()
    let statusStyle = ""
    if (v === "pending") statusStyle = "background-color: #FEF3C7; color: #92400E;"
    else if (v === "approved") statusStyle = "background-color: #D1FAE5; color: #065F46;"
    else if (v === "rejected") statusStyle = "background-color: #FEE2E2; color: #991B1B;"

    container.innerHTML = `
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background-color: #4299E1; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">ছুটির আবেদন</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="padding: 25px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px;">দায়ীর তথ্য</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0;"><strong>নাম:</strong> ${leave.name || "N/A"}</p>
              <p style="margin: 5px 0;"><strong>ইমেইল:</strong> ${userEmail}</p>
            </div>
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0;"><strong>মোবাইল:</strong> ${leave.phone || "N/A"}</p>
              <p style="margin: 5px 0;"><strong>স্ট্যাটাস:</strong>
                <span style="${statusStyle} padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                  ${leave.status}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div style="padding: 25px;">
          <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px;">ছুটির বিবরন </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0;"><strong>ছুটির ধরন:</strong> ${leave.leaveType}</p>
              <p style="margin: 5px 0;"><strong>শুরুর তারিখ:</strong> ${formatDate(leave.from)}</p>
              <p style="margin: 5px 0;"><strong>শেষ তারিখ:</strong> ${formatDate(leave.to)}</p>
            </div>
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0;"><strong>মোট দিন:</strong> ${leave.days}</p>
              <p style="margin: 5px 0;"><strong>অনুমুদন করেছে:</strong> ${leave.approvedBy}</p>
            </div>
          </div>
          <div style="margin-top: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">ছুটির কারন:</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px;">
              ${leave.reason}
            </div>
          </div>
        </div>
        <div style="padding: 25px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">বিশেষ দ্রষ্টব্য :</h3>
            <p style="font-size: 14px; color: #4a5568; margin: 0;">ছুটির আবেদনের একটি আনুষ্ঠানিক রেকর্ড এবং এর বর্তমান অবস্থার প্রতিনিধিত্ব করে। অনুগ্রহ করে এটি আপনার রেকর্ডের জন্য সংরক্ষণ করুন।</p>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div style="text-align: center; width: 45%;">
              <div style="border-top: 1px solid #718096; width: 80%; margin: 0 auto;"></div>
              <p style="margin: 5px 0 0 0;">দায়ী স্বাক্ষর</p>
            </div>
            <div style="text-align: center; width: 45%;">
              <div style="border-top: 1px solid #718096; width: 80%; margin: 0 auto;"></div>
              <p style="margin: 5px 0 0 0;">এডমিন স্বাক্ষর</p>
            </div>
          </div>
        </div>
        <div style="background-color: #4299E1; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ. © ${new Date().getFullYear()}</p>
        </div>
      </div>
    `
    const opt = {
      margin: 10,
      filename: `leave_approval_${leave.leaveType}_${leave.from.split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    }
    html2pdf().from(container).set(opt).save()
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-6xl mx-auto shadow-lg rounded-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 md:pb-6 border-b border-gray-200">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Leave Management</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-md transition-colors duration-200"
              onClick={() => {
                setSelectedLeave(null) // Clear selected leave for new form
                setShowForm(true)
              }}
            >
              + Apply Leave
            </Button>
            <Button
              onClick={handleDownloadAll}
              variant="outline"
              className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 hover:text-white px-6 py-3 rounded-md shadow-md transition-colors duration-200"
            >
              <Download className="h-5 w-5" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="z-30 max-w-[95vw] max-h-[90vh] overflow-y-auto bg-white p-6 rounded-lg shadow-xl">
                <LeaveForm
                  onClose={() => {
                    setShowForm(false)
                    setSelectedLeave(null)
                  }}
                  onRefresh={fetchLeaves}
                  existingData={selectedLeave}
                  userEmail={userEmail}
                  userName={userName}
                />
              </div>
            </div>
          )}
          <div className="overflow-x-auto" ref={pdfRef}>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="text-gray-700 font-semibold">Type</TableHead>
                  <TableHead className="text-gray-700 font-semibold">From</TableHead>
                  <TableHead className="text-gray-700 font-semibold">To</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Days</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Phone</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Reason</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-center">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length > 0 ? (
                  leaves.map((leave, index) => (
                    <TableRow key={leave.id ?? index} className="hover:bg-gray-50 transition-colors duration-150">
                      <TableCell className="py-3">{leave.leaveType}</TableCell>
                      <TableCell className="py-3">{new Date(leave.from).toLocaleDateString()}</TableCell>
                      <TableCell className="py-3">{new Date(leave.to).toLocaleDateString()}</TableCell>
                      <TableCell className="py-3">{leave.days}</TableCell>
                      <TableCell className="py-3">{leave.phone || "N/A"}</TableCell>
                      <TableCell className="py-3 max-w-[200px] truncate">{leave.reason}</TableCell>
                      <TableCell className="py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center justify-center ${statusClass(
                            leave.status,
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          {leave.status.toLowerCase() === "pending" ? (
                            <Button
                              variant="ghost"
                              onClick={() => handleEdit(leave)}
                              className="text-blue-600 hover:text-blue-800 p-2 h-auto"
                            >
                              Edit
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => handleDownloadSingleLeave(leave)}
                              className="text-green-600 hover:text-green-800 p-2 h-auto"
                            >
                              Download PDF
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-10">
                      No leave records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LeaveTable
