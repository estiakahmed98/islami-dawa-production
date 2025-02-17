//Estiak

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";

const userLeaveDataPath = path.join(
  process.cwd(),
  "app/data/userLeaveData.json"
);

interface Leave {
  id: string;
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

// ✅ **Ensure the Data File Exists**
if (!fs.existsSync(userLeaveDataPath)) {
  fs.writeFileSync(
    userLeaveDataPath,
    JSON.stringify({ records: {} }, null, 2),
    "utf-8"
  );
}

// ✅ **Read Data**
const readData = (): UserLeaveData => {
  try {
    const fileContent = fs.readFileSync(userLeaveDataPath, "utf-8").trim();
    return fileContent ? JSON.parse(fileContent) : { records: {} };
  } catch (error) {
    console.error("Error reading data file:", error);
    return { records: {} };
  }
};

// ✅ **Write Data**
const writeData = (data: UserLeaveData) => {
  try {
    fs.writeFileSync(userLeaveDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to data file:", error);
  }
};

// ✅ **Validation Schema**
const validationSchema = Yup.object({
  leaveType: Yup.string().required("Leave Type is required"),
  from: Yup.string().required("Start Date is required"),
  to: Yup.string().required("End Date is required"),
  days: Yup.number().required("Days Field is required"),
  reason: Yup.string().required("Reason is required"),
  approvedBy: Yup.string().required("Approved By is required"),
  status: Yup.string().required("Status is required"),
});

// ✅ **GET: Fetch Leave Requests**
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

// ✅ **POST: Add a New Leave Request**
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

    // ✅ Add unique ID for each leave request
    const newLeave: Leave = {
      id: uuidv4(),
      leaveType,
      from,
      to,
      days,
      reason,
      approvedBy,
      status,
    };

    data.records[email][currentDate].push(newLeave);

    writeData(data);
    return NextResponse.json(
      { message: "Leave added successfully", newLeave },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ **PUT: Update an Existing Leave Request by `id`**
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await validationSchema.validate(body, { abortEarly: false });

    const { id, email, leaveType, from, to, days, reason, approvedBy, status } =
      body;

    if (!email || !id) {
      return NextResponse.json(
        { error: "Email and ID are required." },
        { status: 400 }
      );
    }

    const data = readData();
    let updated = false;

    // ✅ Find and update leave request using `id`
    for (const date in data.records[email]) {
      data.records[email][date] = data.records[email][date].map((leave) => {
        if (leave.id === id) {
          updated = true;
          return { id, leaveType, from, to, days, reason, approvedBy, status };
        }
        return leave;
      });
    }

    if (!updated) {
      return NextResponse.json({ error: "Leave not found." }, { status: 404 });
    }

    writeData(data);
    return NextResponse.json(
      { message: "Leave updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update leave." },
      { status: 500 }
    );
  }
}
