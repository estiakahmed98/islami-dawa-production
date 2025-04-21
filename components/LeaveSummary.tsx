"use client";

import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface LeaveRecord {
  leaveType: string;
  days: number;
  status: string;
}

interface LeaveSummaryProps {
  leaves: LeaveRecord[];
}

const maxDays: Record<string, number> = {
  Casual: 7,
  Sick: 10,
  Paternity: 5,
  Other: 7,
};

const LeaveSummary: React.FC<LeaveSummaryProps> = ({ leaves }) => {
  // Filter only approved leaves
  const approvedLeaves = leaves.filter((leave) => leave.status === "Approved");

  const summary = Object.keys(maxDays).map((type) => {
    const used = approvedLeaves
      .filter((l) => l.leaveType === type)
      .reduce((acc, curr) => acc + Number(curr.days), 0);

    const max = maxDays[type];
    const value = Math.min((used / max) * 100, 100);

    return {
      type,
      used,
      remaining: max - used,
      percentage: value,
    };
  });

  const colorMap: Record<string, string> = {
    Casual: "#10b981", // green
    Sick: "#ef4444", // red
    Paternity: "#3b82f6", // blue
    Other: "#eab308", // yellow
  };

  return (
    <div className="flex flex-wrap gap-10 mb-6">
      {summary.map(({ type, used, remaining, percentage }) => (
        <div key={type} className="w-28 text-center">
          <CircularProgressbar
            value={percentage}
            text={type === "Casual" ? `${remaining}` : `${used}`}
            styles={buildStyles({
              pathColor: colorMap[type],
              textColor: "#1f2937",
              trailColor: "#e5e7eb",
              textSize: "20px",
            })}
            strokeWidth={12}
          />
          <div className="mt-2">
            <p className="text-sm font-semibold">{type} Leave</p>
            <p className="text-xs text-gray-500">
              {type === "Casual" ? "remaining" : "taken"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveSummary;
