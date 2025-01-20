"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

interface LeaveFormProps {
  onClose: () => void;
  onRefresh: () => void;
  existingData?: any; // ✅ Existing leave data
  userEmail: string; // ✅ Required for API
}

const validationSchema = Yup.object().shape({
  leaveType: Yup.string().required("Leave Type is required"),
  from: Yup.date().nullable().required("Start Date is required"),
  to: Yup.date().nullable().required("End Date is required"),
  days: Yup.number().required("Days Field is required"),
  reason: Yup.string().required("Reason is required"),
  approvedBy: Yup.string().required("Approved By is required"),
  status: Yup.string().required("Status is required"),
});

const LeaveForm: React.FC<LeaveFormProps> = ({
  onClose,
  onRefresh,
  existingData,
  userEmail,
}) => {
  const isEditing = !!existingData && existingData.status === "Pending";
  const isReadOnly = !!existingData && existingData.status !== "Pending";

  const initialValues = {
    id: existingData?.id || "",
    email: userEmail, // ✅ Include email for API
    leaveType: existingData?.leaveType || "",
    from: existingData?.from ? new Date(existingData.from) : null,
    to: existingData?.to ? new Date(existingData.to) : null,
    days: existingData?.days || 0,
    reason: existingData?.reason || "",
    approvedBy: existingData?.approvedBy || "",
    status: existingData?.status || "Pending",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-[80vh] max-h-[70vh] overflow-y-auto">
        <h2 className="mb-4 text-xl font-semibold">
          {isEditing ? "Edit Leave Request" : "Leave Details"}
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            if (isSubmittedToday) {
              toast.error("You have already applied for leave today.");
              setSubmitting(false);
              return;
            }
          
            if (!email) {
              toast.error("User email is not set. Please log in.");
              setSubmitting(false);
              return;
            }
          
            const formData = { ...values, email };
          
            try {
              // Submit leave data
              const response = await fetch("/api/leaves", {
                method: isEditing ? "PUT" : "POST",
                body: JSON.stringify(formattedValues),
                headers: { "Content-Type": "application/json" },
              });
          
              if (response.ok) {
                // Format dates for the email payload
                const formattedFromDate = values.from
                  ? new Date(values.from).toLocaleDateString()
                  : "N/A";
                const formattedToDate = values.to
                  ? new Date(values.to).toLocaleDateString()
                  : "N/A";
          
                // Send email
                await fetch("/api/emails", {
                  method: "POST",
                  body: JSON.stringify({
                    email: "faysalmohammed.shah@gmail.com", // Replace with dynamic recipient email if needed
                    name: session?.user?.name || "User",
                    leaveType: values.leaveType,
                    reason: values.reason,
                    leaveDates: `${formattedFromDate} - ${formattedToDate}`,
                  }),
                  
                  headers: { "Content-Type": "application/json" },
                });
                console.log(`${formattedFromDate} - ${formattedToDate}`)
          
                toast.success("Leave application submitted successfully!");
                resetForm();
                onRefresh();
                onClose();
              } else {
                const errorData = await response.json();
                toast.error(
                  errorData.error || "Failed to process leave request."
                );
              }
            } catch (error) {
              toast.error("Error processing request.");
            } finally {
              setSubmitting(false);
            }
          }}
          
        >
          {({ setFieldValue, values }) => (
            <Form className="space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block font-medium">Leave Type</label>
                <Field
                  as="select"
                  name="leaveType"
                  disabled={isReadOnly}
                  className="border rounded-md p-2 w-full"
                >
                  <option value="" disabled>
                    Select Leave Type
                  </option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                </Field>
                <ErrorMessage
                  name="leaveType"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Pickers */}
                <div>
                  <label className="block font-medium">From</label>
                  <Calendar
                    mode="single"
                    selected={values.from || undefined}
                    onSelect={(date) => setFieldValue("from", date)}
                    disabled={isReadOnly}
                  />
                  <ErrorMessage
                    name="from"
                    component="div"
                    className="text-red-500"
                  />
                </div>

                <div>
                  <label className="block font-medium">To</label>
                  <Calendar
                    mode="single"
                    selected={values.to || undefined}
                    onSelect={(date) => setFieldValue("to", date)}
                    disabled={isReadOnly}
                  />
                  <ErrorMessage
                    name="to"
                    component="div"
                    className="text-red-500"
                  />
                </div>
              </div>

              {/* Days */}
              <div>
                <label className="block font-medium">Days</label>
                <Field
                  name="days"
                  type="number"
                  as={Input}
                  disabled={isReadOnly}
                />
                <ErrorMessage
                  name="days"
                  component="div"
                  className="text-red-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-medium">Reason</label>
                <Field name="reason" as={Input} disabled={isReadOnly} />
                <ErrorMessage
                  name="reason"
                  component="div"
                  className="text-red-500"
                />
              </div>

              {/* Approved By */}
              <div>
                <label className="block font-medium">Approved By</label>
                <Field name="approvedBy" as={Input} disabled={isReadOnly} />
                <ErrorMessage
                  name="approvedBy"
                  component="div"
                  className="text-red-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                {!isReadOnly && (
                  <Button type="submit">
                    {isEditing ? "Update Leave" : "Submit"}
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LeaveForm;
