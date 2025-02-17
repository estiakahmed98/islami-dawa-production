//Estiak

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userLeaveDataPath = path.join(
  process.cwd(),
  "app/data/userLeaveData.json"
);

// Type definitions
interface Leave {
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  approvedBy: string;
  status: string;
}

interface UserLeaveData {
  records: Record<string, Record<string, Leave[]>>;
}

// Ensure the data file exists
if (!fs.existsSync(userLeaveDataPath)) {
  fs.writeFileSync(
    userLeaveDataPath,
    JSON.stringify({ records: {} }, null, 2),
    "utf-8"
  );
}

// Read Leave Data
const readLeaveData = (): UserLeaveData => {
  try {
    const fileContent = fs.readFileSync(userLeaveDataPath, "utf-8").trim();
    return fileContent
      ? (JSON.parse(fileContent) as UserLeaveData)
      : { records: {} };
  } catch (error) {
    console.error("Error reading leave data file:", error);
    return { records: {} };
  }
};

// Write Leave Data
const writeLeaveData = (data: UserLeaveData) => {
  try {
    fs.writeFileSync(userLeaveDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing leave data file:", error);
  }
};

// ✅ GET: Fetch all pending leave requests (Admin View)
export async function GET(req: NextRequest) {
  try {
    const leaveData = readLeaveData();
    const allRequests = Object.entries(leaveData.records).flatMap(
      ([email, dates]) =>
        Object.entries(dates).flatMap(([date, requests]) =>
          requests.map((request, index) => ({
            email,
            date,
            index,
            ...request,
          }))
        )
    );

    return NextResponse.json({ leaveRequests: allRequests }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leave data." },
      { status: 500 }
    );
  }
}

// ✅ POST: Approve or Reject a Leave Request (Update `userLeaveData.json`)
export async function POST(req: NextRequest) {
  try {
    const { email, date, index, status } = await req.json();
    if (!email || !date || index === undefined || !status) {
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    const leaveData = readLeaveData();
    if (leaveData.records[email]?.[date]?.[index]) {
      leaveData.records[email][date][index].status = status;
      writeLeaveData(leaveData);
      return NextResponse.json(
        { message: "Leave status updated successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
