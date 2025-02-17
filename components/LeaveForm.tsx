"use client"; //Estiak

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface LeaveFormProps {
  onClose: () => void;
  onRefresh: () => void;
}

interface LeaveFormValues {
  leaveType: string;
  from: Date | null;
  to: Date | null;
  days: number;
  reason: string;
  approvedBy: string;
  status: string;
}

const initialValues: LeaveFormValues = {
  leaveType: "",
  from: null,
  to: null,
  days: 0,
  reason: "",
  approvedBy: "",
  status: "Pending",
};

const validationSchema = Yup.object().shape({
  leaveType: Yup.string().required("Leave Type is required"),
  from: Yup.date().nullable().required("Start Date is required"),
  to: Yup.date().nullable().required("End Date is required"),
  days: Yup.number()
    .typeError("Days must be a number")
    .required("Days Field is required"),
  reason: Yup.string().required("Reason is required"),
  approvedBy: Yup.string().required("Approved By is required"),
  status: Yup.string().required("Status is required"),
});

const LeaveForm: React.FC<LeaveFormProps> = ({ onClose, onRefresh }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!email) return;

      try {
        const response = await fetch(`/api/leaves?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          setIsSubmittedToday(data.isSubmittedToday);
        } else {
          toast.error("Failed to check leave submission status.");
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
        toast.error("Error checking leave submission status.");
      } finally {
        setLoading(false);
      }
    };

    checkSubmissionStatus();
  }, [email]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="modal bg-white p-10 border rounded-sm">
      <div className="modal-content">
        {isSubmittedToday && (
          <div className="bg-red-500 text-red-500 p-4 rounded-lg mb-8">
            You have already applied for leave today.
          </div>
        )}

        <h2 className="mb-6 text-2xl">Apply for Leave</h2>

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
                method: "POST",
                body: JSON.stringify(formData),
                headers: { "Content-Type": "application/json" },
              });

              if (response.ok) {
                // Format dates for the email payload
                const formattedFromDate = values.from
                  ? new Date(values.from)
                  : "N/A";
                const formattedToDate = values.to ? new Date(values.to) : "N/A";

                // Send email
                await fetch("/api/emails", {
                  method: "POST",
                  body: JSON.stringify({
                    action: "leaveApplication",
                    email: "faysalmohammed.shah@gmail.com", // Replace with dynamic recipient email if needed
                    name: session?.user?.name || "User",
                    leaveType: values.leaveType,
                    reason: values.reason,
                    leaveDates: `${formattedFromDate} - ${formattedToDate}`,
                  }),
                  headers: { "Content-Type": "application/json" },
                });

                toast.success("Leave application submitted successfully!");
                resetForm();
                onRefresh();
                onClose();
                router.push("/dashboard/leave");
              } else {
                toast.error("Leave application submission failed! Try again.");
              }
            } catch (error) {
              console.error("Error during leave application:", error);
              toast.error("An unexpected error occurred. Please try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div>
                <label className="block mb-2 font-medium">Leave Type</label>
                <Field
                  as="select"
                  name="leaveType"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label>From</label>
                  <Calendar
                    mode="single"
                    selected={values.from || undefined}
                    onSelect={(date) => setFieldValue("from", date)}
                  />
                  <ErrorMessage
                    name="from"
                    component="div"
                    className="text-red-500"
                  />
                </div>

                <div>
                  <label>To</label>
                  <Calendar
                    mode="single"
                    selected={values.to || undefined}
                    onSelect={(date) => setFieldValue("to", date)}
                  />
                  <ErrorMessage
                    name="to"
                    component="div"
                    className="text-red-500"
                  />
                </div>
              </div>

              <div>
                <label>Days</label>
                <Field
                  name="days"
                  type="number"
                  as={Input}
                  placeholder="Enter number of days"
                />
                <ErrorMessage
                  name="days"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label>Reason</label>
                <Field name="reason" as={Input} placeholder="Enter reason" />
                <ErrorMessage
                  name="reason"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div>
                <label>Requested By</label>
                <Field
                  name="approvedBy"
                  as={Input}
                  placeholder="Enter approver's name"
                />
                <ErrorMessage
                  name="approvedBy"
                  component="div"
                  className="text-red-500"
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  variant="ghost"
                  size="default"
                  type="submit"
                  disabled={isSubmittedToday}
                >
                  Submit
                </Button>
                <Button type="button" onClick={onClose} variant="outline">
                  Cancel
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
