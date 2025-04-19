"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface LeaveRecord {
  id?: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  approvedBy: string;
  status: string;
  phone?: string;
}

interface LeaveFormProps {
  onClose: () => void;
  onRefresh: () => void;
  existingData: LeaveRecord | null;
  userEmail: string;
  userName?: string;
}

const LeaveForm: React.FC<LeaveFormProps> = ({
  onClose,
  onRefresh,
  existingData,
  userEmail,
  userName = "",
}) => {
  const [formData, setFormData] = useState<LeaveRecord>({
    leaveType: "",
    from: "",
    to: "",
    days: 0,
    reason: "",
    approvedBy: "Admin",
    status: "Pending",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (existingData) {
      setFormData({
        leaveType: existingData.leaveType || "",
        from: existingData.from || "",
        to: existingData.to || "",
        days: existingData.days || 0,
        reason: existingData.reason || "",
        approvedBy: existingData.approvedBy || "Admin",
        status: existingData.status || "Pending",
        phone: existingData.phone || "",
        id: existingData.id || undefined,
      });
    }
  }, [existingData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.leaveType) newErrors.leaveType = "Leave type is required";
    if (!formData.from) newErrors.from = "Start date is required";
    if (!formData.to) newErrors.to = "End date is required";
    if (formData.days <= 0) newErrors.days = "Days must be greater than 0";
    if (!formData.reason) newErrors.reason = "Reason is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";

    // Validate phone number format (Bangladesh format)
    if (formData.phone && !/^01[3-9]\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid Bangladesh phone number";
    }

    // Validate date range
    if (formData.from && formData.to) {
      const fromDate = new Date(formData.from);
      const toDate = new Date(formData.to);

      if (fromDate > toDate) {
        newErrors.to = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDays = (from: string, to: string) => {
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Reset time part to ensure we're only comparing dates
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      // Calculate the difference in milliseconds
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());

      // Convert to days and add 1 to include both start and end dates
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return diffDays;
    }
    return 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field when user makes a selection
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the date field
    const updatedForm = { ...formData, [name]: value };

    // Recalculate days if both dates are present
    if (updatedForm.from && updatedForm.to) {
      updatedForm.days = calculateDays(updatedForm.from, updatedForm.to);
    }

    setFormData(updatedForm);

    // Clear any existing errors for these fields
    const newErrors = { ...errors };
    if (name === "from" && newErrors.from) delete newErrors.from;
    if (name === "to" && newErrors.to) delete newErrors.to;
    if (newErrors.days) delete newErrors.days;
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        email: userEmail,
        name: userName,
      };

      const url = "/api/leaves";
      const method = existingData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onRefresh();
        onClose();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to save leave request"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditable = !existingData || existingData.status === "Pending";

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {existingData
            ? isEditable
              ? "Edit Leave Request"
              : "View Leave Request"
            : "New Leave Request"}
        </h2>
        <Button variant="ghost" onClick={onClose} size="icon">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select
              disabled={!isEditable}
              value={formData.leaveType}
              onValueChange={(value) => handleSelectChange("leaveType", value)}
            >
              <SelectTrigger
                id="leaveType"
                className={errors.leaveType ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Casual">Casual Leave</SelectItem>
                <SelectItem value="Sick">Sick Leave</SelectItem>
                <SelectItem value="Annual">Annual Leave</SelectItem>
                <SelectItem value="Maternity">Maternity Leave</SelectItem>
                <SelectItem value="Paternity">Paternity Leave</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.leaveType && (
              <p className="text-red-500 text-sm">{errors.leaveType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditable}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="from">From Date</Label>
            <Input
              id="from"
              name="from"
              type="date"
              value={formData.from}
              onChange={handleDateChange}
              disabled={!isEditable}
              className={errors.from ? "border-red-500" : ""}
            />
            {errors.from && (
              <p className="text-red-500 text-sm">{errors.from}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To Date</Label>
            <Input
              id="to"
              name="to"
              type="date"
              value={formData.to}
              onChange={handleDateChange}
              disabled={!isEditable}
              className={errors.to ? "border-red-500" : ""}
            />
            {errors.to && <p className="text-red-500 text-sm">{errors.to}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Total Days</Label>
            <Input
              id="days"
              name="days"
              type="number"
              value={formData.days}
              onChange={handleChange}
              disabled
              className={errors.days ? "border-red-500" : ""}
            />
            {errors.days && (
              <p className="text-red-500 text-sm">{errors.days}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            name="reason"
            placeholder="Please provide a reason for your leave request"
            value={formData.reason}
            onChange={handleChange}
            disabled={!isEditable}
            className={`min-h-[100px] ${errors.reason ? "border-red-500" : ""}`}
          />
          {errors.reason && (
            <p className="text-red-500 text-sm">{errors.reason}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isEditable && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : existingData ? "Update" : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LeaveForm;
