import { Html } from "@react-email/components";
import * as React from "react";

interface WelcomeProps {
  name: string;
  leaveType: string;
  reason: string;
  leaveDates:number;
}

export default function DayiLeaveEmail({ name, leaveType, reason , leaveDates }: WelcomeProps) {
  return (
    <Html>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-md rounded-lg max-w-xl w-full p-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Leave Request Submitted
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Hi <span className="font-semibold">{name}</span>, your leave request for the following type has been successfully submitted:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-md py-4 px-4 mb-4">
            <p className="text-lg font-medium text-gray-800">
              <span className="font-semibold">Leave Type:</span> {leaveType}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md py-4 px-4">
            <p className="text-lg font-medium text-gray-800">
              <span className="font-semibold">Reason:</span> {reason}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md py-4 px-4">
            <p className="text-lg font-medium text-gray-800">
              <span className="font-semibold">Date:</span> {leaveDates}
            </p>
          </div>
          <p className="text-gray-600 text-sm text-center mt-6">
            You will be notified once your leave request is reviewed. If you have any questions, please contact support.
          </p>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Thank you, <br />
              <span className="font-semibold">The HR Team</span>
            </p>
          </div>
        </div>
      </div>
    </Html>
  );
}
