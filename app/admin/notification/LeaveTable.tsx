"use client"

import React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge, ChevronDown, ChevronRight, Download, Loader2, Search, X } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

const html2pdf = dynamic(() => import("html2pdf.js").then((module) => module.default), { ssr: false })

interface LeaveRecord {
  id: string
  userId: string
  leaveType: string
  fromDate: string
  toDate: string
  days: number
  reason: string
  approvedBy: string | null
  status: string
  requestDate: string
  user: {
    name: string | null
    email: string
    phone: string | null
  }
}

interface LeaveUserSummary {
  name: string
  email: string
  phone?: string
  casual: number
  sick: number
  maternity: number // Added maternity
  paternity: number
  annual: number // Added annual
  other: number
  total: number
  pendingCount: number // Added pending count
  leaves: LeaveRecord[] // full list of their leaves
}

const AdminLeaveManagement: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRecord[]>([])
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})
  const tableRef = useRef<HTMLDivElement>(null)

  const fetchLeaveRequestsForAdmin = useCallback(async () => {
    try {
      const response = await fetch("/api/leaves") // Fetch all leaves for admin
      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data.leaveRequests)
        setFilteredLeaves(data.leaveRequests)
      } else {
        const errorData = await response.json()
        toast.error(`Failed to fetch leave requests: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error)
      toast.error("An unexpected error occurred while fetching leave requests.")
    }
  }, [])

  useEffect(() => {
    fetchLeaveRequestsForAdmin()
  }, [fetchLeaveRequestsForAdmin])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLeaves(leaveRequests)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = leaveRequests.filter(
        (leave) =>
          (leave.user.email && leave.user.email.toLowerCase().includes(lowercasedSearch)) ||
          (leave.user.name && leave.user.name.toLowerCase().includes(lowercasedSearch)) ||
          (leave.user.phone && leave.user.phone.includes(lowercasedSearch)) ||
          leave.leaveType.toLowerCase().includes(lowercasedSearch) ||
          leave.reason.toLowerCase().includes(lowercasedSearch) ||
          leave.status.toLowerCase().includes(lowercasedSearch),
      )
      setFilteredLeaves(filtered)
    }
  }, [searchTerm, leaveRequests])

  const groupLeavesByUser = (leaves: LeaveRecord[]): LeaveUserSummary[] => {
    const grouped: Record<string, LeaveUserSummary> = {}
    for (const leave of leaves) {
      const email = leave.user.email
      if (!grouped[email]) {
        grouped[email] = {
          name: leave.user.name || "N/A",
          email,
          phone: leave.user.phone || "N/A",
          casual: 0,
          sick: 0,
          maternity: 0,
          paternity: 0,
          annual: 0,
          other: 0,
          total: 0,
          pendingCount: 0,
          leaves: [],
        }
      }
      grouped[email].leaves.push(leave)
      
      // Count pending requests
      if (leave.status.toLowerCase() === "pending") {
        grouped[email].pendingCount += 1
      }
      
      // Only count approved leaves in the summary totals
      if (leave.status.toLowerCase() === "approved") {
        const type = leave.leaveType.toLowerCase()
        const days = Number(leave.days)
        if (type === "casual") grouped[email].casual += days
        else if (type === "sick") grouped[email].sick += days
        else if (type === "maternity") grouped[email].maternity += days
        else if (type === "paternity") grouped[email].paternity += days
        else if (type === "annual") grouped[email].annual += days
        else grouped[email].other += days
        grouped[email].total += days
      }
    }
    return Object.values(grouped)
  }

  const toggleUser = (email: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [email]: !prev[email],
    }))
  }

  const handleDownloadAll = async () => {
    if (tableRef.current) {
      setIsGeneratingPdf(true)
      try {
        const element = tableRef.current.cloneNode(true) as HTMLElement
        const container = document.createElement("div")
        container.style.padding = "30px"
        container.style.fontFamily = "Arial, sans-serif"

        const header = document.createElement("div")
        header.style.display = "flex"
        header.style.justifyContent = "space-between"
        header.style.alignItems = "center"
        header.style.marginBottom = "30px"
        header.style.borderBottom = "2px solid #333"
        header.style.paddingBottom = "15px"
        const title = document.createElement("h1")
        title.textContent = "ছুটি সম্পর্কিত তথ্য"
        title.style.color = "#2d3748"
        title.style.margin = "0"
        title.style.fontSize = "28px"
        title.style.fontWeight = "bold"
        header.appendChild(title)
        container.appendChild(header)

        const meta = document.createElement("div")
        meta.style.marginBottom = "25px"
        meta.style.padding = "15px"
        meta.style.backgroundColor = "#f9fafb"
        meta.style.borderRadius = "6px"
        meta.style.border = "1px solid #e5e7eb"
        const currentDate = new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        const userSummaries = groupLeavesByUser(filteredLeaves)
        meta.innerHTML = `
          <div style="display:flex;justify-content:space-between">
            <p style="margin:5px 0;font-size:14px;"><strong>ডাউনলোডের তারিখ ও সময়:</strong> ${currentDate}</p>
            <p style="margin:5px 0;font-size:14px;"><strong>মোট দাঁয়ী:</strong> ${userSummaries.length}</p>
          </div>
        `
        container.appendChild(meta)

        const summaryTable = document.createElement("table")
        summaryTable.style.width = "100%"
        summaryTable.style.borderCollapse = "collapse"
        summaryTable.style.fontSize = "12px"
        summaryTable.style.marginBottom = "20px"

        const thead = document.createElement("thead")
        thead.innerHTML = `
          <tr>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Name</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Email</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Phone</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Casual</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Sick</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Maternity</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Paternity</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Annual</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Other</th>
            <th style="background-color: #2d3748; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;">Total</th>
          </tr>
        `
        summaryTable.appendChild(thead)

        const tbody = document.createElement("tbody")
        userSummaries.forEach((user, index) => {
          const row = document.createElement("tr")
          row.style.backgroundColor = index % 2 === 0 ? "#f8fafc" : "white"
          row.innerHTML = `
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.name}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.email}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.phone}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.casual}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.sick}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.maternity}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.paternity}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.annual}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${user.other}</td>
            <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: bold;">${user.total}</td>
          `
          tbody.appendChild(row)
        })
        summaryTable.appendChild(tbody)
        container.appendChild(summaryTable)

        const footer = document.createElement("div")
        footer.style.marginTop = "20px"
        footer.style.borderTop = "1px solid #e2e8f0"
        footer.style.paddingTop = "10px"
        footer.style.fontSize = "10px"
        footer.style.color = "#6b7280"
        footer.style.textAlign = "center"
        footer.innerHTML = `<p>Confidential - For Internal Use Only | Page 1</p>`
        container.appendChild(footer)

        const opt = {
          margin: [15, 15],
          filename: `leave_summary_report_${new Date().toISOString().split("T")[0]}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          pagebreak: { mode: "avoid-all" },
        }

        await html2pdf().set(opt).from(container).save()
        toast.success("Summary PDF generated successfully!")
      } catch (error) {
        console.error("Error generating PDF:", error)
        toast.error("Failed to generate PDF. Please try again.")
      } finally {
        setIsGeneratingPdf(false)
      }
    }
  }

  const handleDownloadSingle = async (leave: LeaveRecord) => {
    setIsGeneratingPdf(true) // Use the same loading state for single download
    try {
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
        } catch (e) {
          return dateString
        }
      }

      const fromDate = formatDate(leave.fromDate)
      const toDate = formatDate(leave.toDate)

      let statusStyle = ""
      let statusBgColor = ""
      let statusTextColor = ""
      if (leave.status.toLowerCase() === "pending") {
        statusBgColor = "#fed7d7"
        statusTextColor = "#9b2c2c"
      } else if (leave.status.toLowerCase() === "approved") {
        statusBgColor = "#10b981"
        statusTextColor = "white"
      } else if (leave.status.toLowerCase() === "rejected") {
        statusBgColor = "#7f1d1d"
        statusTextColor = "white"
      }
      statusStyle = `
        display: inline-block;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: bold;
        background-color: ${statusBgColor};
        color: ${statusTextColor};
      `

      const content = `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
           Header 
          <div style="background-color: #2d3748; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="margin: 0; font-size: 24px;">ছুটির আবেদন</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Generated on ${new Date().toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}</p>
            </div>
          </div>
           Employee Information 
          <div style="padding: 25px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px; border-bottom: 2px solid #cbd5e0; padding-bottom: 10px;">দায়ী তথ্য</h2>
            <div style="display: flex; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">নাম:</strong> ${
                  leave.user.name || "N/A"
                }</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">ইমেইল:</strong> ${
                  leave.user.email
                }</p>
              </div>
              <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">মোবাইল:</strong> ${
                  leave.user.phone || "N/A"
                }</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">স্ট্যাটাস:</strong> <span style="${statusStyle}">${
                  leave.status
                }</span></p>
              </div>
            </div>
          </div>
           Leave Details 
          <div style="padding: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #4a5568; font-size: 18px; border-bottom: 2px solid #cbd5e0; padding-bottom: 10px;">ছুটির বিবরন</h2>
            <div style="display: flex; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">ছুটির ধরন:</strong> ${
                  leave.leaveType
                }</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">শুরুর তারিখ:</strong> ${fromDate}</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">শেষ তারিখ:</strong> ${toDate}</p>
              </div>
              <div style="flex: 1; min-width: 250px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">মোট দিন:</strong> ${
                  leave.days
                }</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong style="color: #4a5568; display: inline-block; width: 100px;">অনুমুদন করেছে:</strong> ${
                  leave.approvedBy || "Pending"
                }</p>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">ছুটির বিবরন:</h3>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 15px; font-size: 15px;">
                ${leave.reason}
              </div>
            </div>
          </div>
           Note & Signature Section 
          <div style="padding: 25px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <div style="margin-bottom: 30px;">
              <h3 style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;">বিশেষ দ্রষ্টব্য:</h3>
              <p style="font-size: 14px; color: #4a5568; margin: 0;"> ছুটির আবেদনের একটি আনুষ্ঠানিক রেকর্ড এবং এর বর্তমান অবস্থার প্রতিনিধিত্ব করে। অনুগ্রহ করে এটি আপনার রেকর্ডের জন্য সংরক্ষণ করুন।</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 40px;">
              <div style="text-align: center; flex: 1;">
                <div style="border-top: 1px solid #718096; width: 80%; margin: 0 auto;"></div>
                <p style="font-size: 14px; margin: 5px 0 0 0;">দায়ী স্বাক্ষর</p>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="border-top: 1px solid #718096; width: 80%; margin: 0 auto;"></div>
                <p style="font-size: 14px; margin: 5px 0 0 0;">এডমিন স্বাক্ষর</p>
              </div>
            </div>
          </div>
           Footer 
          <div style="background-color: #2d3748; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 5px 0 0 0;">ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ. © ${new Date().getFullYear()}</p>
          </div>
        </div>
      `
      container.innerHTML = content

      const opt = {
        margin: 10,
        filename: `leave_request_${leave.user.name || "user"}_${leave.fromDate.split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(container).save()
      toast.success("Leave request PDF generated successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const updateStatus = async (
    leaveId: string,
    userEmail: string,
    newStatus: string,
    approvedBy = "Admin", // Default to "Admin" if not specified
  ) => {
    try {
      const response = await fetch("/api/leaves", {
        method: "PUT",
        body: JSON.stringify({
          id: leaveId,
          email: userEmail, // For ownership verification on the server
          status: newStatus,
          approvedBy: newStatus === "approved" ? approvedBy : null, // Set approvedBy only if approved
        }),
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        toast.success("Leave status updated successfully!")
        fetchLeaveRequestsForAdmin() // Re-fetch data to update the table
      } else {
        const errorData = await response.json()
        toast.error(`Failed to update status: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("An unexpected error occurred while updating status.")
    }
  }

  const userSummaries = groupLeavesByUser(filteredLeaves)

  return (
    <div>
      <Card className="w-full mx-auto shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#155E75] via-[#196d87] to-[#1d90b4] text-white p-6">
          <CardTitle className="text-3xl font-extrabold">Leave Management Dashboard</CardTitle>
          <CardDescription className="text-blue-100 mt-2">
            Overview and management of all submitted leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Download Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-grow w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, phone, type, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <Button
              onClick={handleDownloadAll}
              className="bg-green-700 hover:bg-green-800 text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGeneratingPdf ? "Generating..." : "Download Summary"}
            </Button>
          </div>

          <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200" ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="font-bold text-blue-800">Name</TableHead>
                  <TableHead className="font-bold text-blue-800">Email</TableHead>
                  <TableHead className="font-bold text-blue-800">Phone</TableHead>
                  <TableHead className="font-bold text-blue-800">Casual</TableHead>
                  <TableHead className="font-bold text-blue-800">Sick</TableHead>
                  <TableHead className="font-bold text-blue-800">Maternity</TableHead>
                  <TableHead className="font-bold text-blue-800">Paternity</TableHead>
                  <TableHead className="font-bold text-blue-800">Annual</TableHead>
                  <TableHead className="font-bold text-blue-800">Other</TableHead>
                  <TableHead className="font-bold text-blue-800">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userSummaries.length > 0 ? (
                  userSummaries.map((user, idx) => (
                    <React.Fragment key={`user-summary-${user.email}`}>
                      <TableRow
                        className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                          user.pendingCount > 0 
                            ? "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400" 
                            : ""
                        }`}
                        onClick={() => toggleUser(user.email)}
                      >
                        <TableCell className="font-medium flex items-center text-blue-900">
                          {expandedUsers[user.email] ? (
                            <ChevronDown className="h-4 w-4 mr-2 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2 text-blue-600" />
                          )}
                          <span>
                            {user.name}
                            {user.pendingCount > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">
                                {user.pendingCount}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-700">{user.email}</TableCell>
                        <TableCell className="text-gray-700">{user.phone}</TableCell>
                        <TableCell className="text-gray-700">{user.casual}</TableCell>
                        <TableCell className="text-gray-700">{user.sick}</TableCell>
                        <TableCell className="text-gray-700">{user.maternity}</TableCell>
                        <TableCell className="text-gray-700">{user.paternity}</TableCell>
                        <TableCell className="text-gray-700">{user.annual}</TableCell>
                        <TableCell className="text-gray-700">{user.other}</TableCell>
                        <TableCell className="font-bold text-blue-900">{user.total}</TableCell>
                      </TableRow>
                      {expandedUsers[user.email] && (
                        <TableRow>
                          <TableCell colSpan={10} className="p-0">
                            <div className="bg-blue-50 px-4 py-2 border-t border-b border-blue-200">
                              <h3 className="text-sm font-semibold text-blue-800 mb-2">Leave Details</h3>
                              <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-md border border-blue-100">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-blue-100">
                                      <TableHead className="text-xs text-blue-700">Type</TableHead>
                                      <TableHead className="text-xs text-blue-700">From</TableHead>
                                      <TableHead className="text-xs text-blue-700">To</TableHead>
                                      <TableHead className="text-xs text-blue-700">Days</TableHead>
                                      <TableHead className="text-xs text-blue-700">Reason</TableHead>
                                      <TableHead className="text-xs text-blue-700">Status</TableHead>
                                      <TableHead className="text-xs text-blue-700">Requested On</TableHead>
                                      <TableHead className="text-xs text-blue-700">Approved By</TableHead>
                                      <TableHead className="text-xs text-blue-700">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {user.leaves.map((leave, i) => (
                                      <TableRow 
                                        key={`${leave.id}`} 
                                        className={
                                          leave.status.toLowerCase() === "pending"
                                            ? "bg-yellow-50 border-l-2 border-l-orange-300"
                                            : i % 2 === 0 ? "bg-white" : "bg-blue-50"
                                        }
                                      >
                                        <TableCell className="text-xs capitalize">{leave.leaveType}</TableCell>
                                        <TableCell className="text-xs">
                                          {new Date(leave.fromDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                          {new Date(leave.toDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-xs">{leave.days}</TableCell>
                                        <TableCell className="text-xs max-w-xs truncate">{leave.reason}</TableCell>
                                        <TableCell className="text-xs">
                                          <Badge
                                            className={
                                              leave.status.toLowerCase() === "pending"
                                                ? "bg-yellow-500 text-white"
                                                : leave.status.toLowerCase() === "approved"
                                                  ? "bg-green-500 text-white"
                                                  : "bg-red-500 text-white"
                                            }
                                          >
                                            {leave.status}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                          {new Date(leave.requestDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-xs">{leave.approvedBy || "N/A"}</TableCell>
                                        <TableCell className="text-xs">
                                          <div className="flex gap-1">
                                            <select
                                              value={leave.status}
                                              onChange={(e) =>
                                                updateStatus(leave.id, leave.user.email, e.target.value, "Admin")
                                              }
                                              className="text-xs border rounded p-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            >
                                              <option value="pending">Pending</option>
                                              <option value="approved">Approved</option>
                                              <option value="rejected">Rejected</option>
                                            </select>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                                              onClick={() => handleDownloadSingle(leave)}
                                              disabled={isGeneratingPdf}
                                            >
                                              {isGeneratingPdf ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                              ) : (
                                                <Download className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500 py-4">
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

export default AdminLeaveManagement