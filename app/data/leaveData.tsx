import * as Yup from "yup";

// Interface for Leave Form Data
export interface LeaveFormValues {
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  approvedBy: string;
  status: string;
}

// Initial form values
export const initialLeaveData: LeaveFormValues = {
  leaveType: "",
  from: "",
  to: "",
  days: 0,
  reason: "",
  approvedBy: "",
  status: "Pending",
};

// Validation schema using Yup
export const leaveValidationSchema = Yup.object({
  leaveType: Yup.string().required("Leave Type is required"),
  from: Yup.string().required("Start Date is required"),
  to: Yup.string().required("End Date is required"),
  days: Yup.number()
    .typeError("Days must be a number")
    .required("Days Field is required"),
  reason: Yup.string().required("Reason is required"),
  approvedBy: Yup.string().required("Approved By is required"),
  status: Yup.string().required("Status is required"),
});
