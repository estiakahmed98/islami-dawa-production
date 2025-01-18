import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import * as Yup from "yup";

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
  const initialData: UserLeaveData = { records: {} };
  fs.writeFileSync(
    userLeaveDataPath,
    JSON.stringify(initialData, null, 2),
    "utf-8"
  );
}

// Read data file
const readData = (): UserLeaveData => {
  try {
    const fileContent = fs.readFileSync(userLeaveDataPath, "utf-8").trim();
    return fileContent
      ? (JSON.parse(fileContent) as UserLeaveData)
      : { records: {} };
  } catch (error) {
    console.error("Error reading data file:", error);
    return { records: {} };
  }
};

// Write data to the file
const writeData = (data: UserLeaveData) => {
  try {
    fs.writeFileSync(userLeaveDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to data file:", error);
  }
};

// Validation schema
const validationSchema = Yup.object({
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

// ✅ GET: Fetch all leave requests for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email)
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );

    const data = readData();
    return NextResponse.json(
      { leaveRequests: data.records[email] || {} },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leave data." },
      { status: 500 }
    );
  }
}

// ✅ POST: Submit a new leave request (Append Data)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await validationSchema.validate(body, { abortEarly: false });

    const { email, leaveType, from, to, days, reason, approvedBy, status } =
      body;
    const currentDate = new Date().toISOString().split("T")[0];

    if (!email)
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );

    const data = readData();
    if (!data.records[email]) data.records[email] = {};
    if (!data.records[email][currentDate])
      data.records[email][currentDate] = [];

    // Append new leave request
    data.records[email][currentDate].push({
      leaveType,
      from,
      to,
      days,
      reason,
      approvedBy,
      status,
    });

    writeData(data);
    return NextResponse.json(
      { message: "Leave added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Remove a specific leave request
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, date, index } = body;

    if (!email || !date || index === undefined)
      return NextResponse.json(
        { error: "Email, Date, and Index are required." },
        { status: 400 }
      );

    const data = readData();
    if (data.records[email]?.[date]) {
      data.records[email][date].splice(index, 1);
      if (data.records[email][date].length === 0)
        delete data.records[email][date]; // Remove empty date
      writeData(data);
      return NextResponse.json(
        { message: "Leave deleted successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "No leave found for the specified date." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
