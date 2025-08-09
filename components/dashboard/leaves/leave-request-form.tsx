"use client"

import type React from "react"
import { useState, useEffect } from "react" // Import useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface LeaveRequestFormProps {
  userEmail: string
  onSubmissionSuccess: () => void
  onClose: () => void
}

export function LeaveRequestForm({ userEmail, onSubmissionSuccess, onClose }: LeaveRequestFormProps) {
  const [leaveType, setLeaveType] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [calculatedDays, setCalculatedDays] = useState<number | null>(null) // State for calculated days
  const [reason, setReason] = useState("")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  // Effect to calculate days when fromDate or toDate changes
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate)
      const end = new Date(toDate)
      // Set both dates to UTC midnight to avoid timezone issues affecting day count
      start.setUTCHours(0, 0, 0, 0)
      end.setUTCHours(0, 0, 0, 0)

      if (start <= end) {
        const timeDiff = Math.abs(end.getTime() - start.getTime())
        const days = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1 // +1 for inclusive days
        setCalculatedDays(days)
      } else {
        setCalculatedDays(null) // Invalid date range
      }
    } else {
      setCalculatedDays(null)
    }
  }, [fromDate, toDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          name,
          phone,
          leaveType,
          from: fromDate,
          to: toDate,
          reason,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        // If validation errors are returned, display them
        if (data.errors) {
          Object.values(data.errors).forEach((msg) => toast.error(msg as string))
        } else {
          throw new Error(data.error || "Failed to submit leave request.")
        }
      } else {
        toast.success("Leave request submitted successfully!")
        // Clear form
        setLeaveType("")
        setFromDate("")
        setToDate("")
        setCalculatedDays(null)
        setReason("")
        setPhone("")
        setName("")
        onSubmissionSuccess() // Notify parent to refresh table
        onClose() // Close the dialog
      }
    } catch (error: any) {
      toast.error(`Error submitting leave request: ${error.message || "An unexpected error occurred."}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., 01712345678"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="leaveType">Leave Type</Label>
        <Select value={leaveType} onValueChange={setLeaveType} required>
          <SelectTrigger id="leaveType">
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="casual">Casual Leave</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="maternity">Maternity Leave</SelectItem>
            <SelectItem value="paternity">Paternity Leave</SelectItem>
            <SelectItem value="annual">Annual Leave</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromDate">From Date</Label>
          <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="toDate">To Date</Label>
          <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
        </div>
      </div>
      {calculatedDays !== null && (
        <div className="space-y-2">
          <Label htmlFor="calculatedDays">Calculated Days</Label>
          <Input id="calculatedDays" type="text" value={calculatedDays} readOnly className="font-bold" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly describe your reason for leave"
          className="min-h-[100px]"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-colors"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Leave Request"}
        </Button>
      </div>
    </form>
  )
}
