//Faysal

import DayiLeaveEmail from "@/emails/DayiLeaveEmail";
import { Resend } from "resend";
import LeaveApprovalEmail from "@/emails/DayiLeaveApprovalEmail";
import LeaveRejectedEmail from "@/emails/DayiLeaveRejectedEmail"; // Assuming you have a "LeaveRejectedEmail" component for the rejection email

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, name, leaveType, reason, leaveDates, action } =
    await request.json();

  if (action === "leaveApplication") {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Leave Application Submitted",
      react: DayiLeaveEmail({ name, leaveType, reason, leaveDates }),
    });
    return new Response(
      JSON.stringify({ message: "Leave application email sent successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else if (action === "leaveApproval") {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Leave Application Approved",
      react: LeaveApprovalEmail({ name, leaveType, leaveDates }),
    });
    return new Response(
      JSON.stringify({ message: "Leave approval email sent successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else if (action === "leaveRejection") {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Leave Application Rejected",
      react: LeaveRejectedEmail({ name, leaveType, reason, leaveDates }), // Send the rejection email
    });
    return new Response(
      JSON.stringify({ message: "Leave rejection email sent successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else {
    return new Response(JSON.stringify({ error: "Invalid action specified" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
