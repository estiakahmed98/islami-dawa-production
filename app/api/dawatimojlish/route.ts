//Juwel

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath = path.join(
  process.cwd(),
  "app/data/dawatiMojlishUserData.ts"
);

interface DawatiMojlishData {
  [key: string]: string | number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as DawatiMojlishData & { email: string };

    if (!email || Object.keys(data).length === 0) {
      return new NextResponse("Email and data are required", { status: 400 });
    }

    const currentDate = new Date().toISOString().split("T")[0];

    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(
        userDataPath,
        `export const userDawatiMojlishData = { records: {} };`,
        "utf-8"
      );
    }

    const fileContent = fs.readFileSync(userDataPath, "utf-8");
    const userDawatiMojlishData = eval(
      `(${fileContent.slice(
        fileContent.indexOf("{"),
        fileContent.lastIndexOf("}") + 1
      )})`
    );

    if (!userDawatiMojlishData.records[email]) {
      userDawatiMojlishData.records[email] = {};
    }

    if (userDawatiMojlishData.records[email][currentDate]) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    userDawatiMojlishData.records[email][currentDate] = { ...data };

    fs.writeFileSync(
      userDataPath,
      `export const userDawatiMojlishData = ${JSON.stringify(
        userDawatiMojlishData,
        null,
        2
      )};`,
      "utf-8"
    );

    return NextResponse.json(
      { message: "Submission successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return new NextResponse("Failed to save user data", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const today = new Date().toISOString().split("T")[0];

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    if (!fs.existsSync(userDataPath)) {
      return NextResponse.json({ isSubmittedToday: false }, { status: 200 });
    }

    const fileContent = fs.readFileSync(userDataPath, "utf-8");
    const userDawatiMojlishData = eval(
      `(${fileContent.slice(
        fileContent.indexOf("{"),
        fileContent.lastIndexOf("}") + 1
      )})`
    );

    const isSubmittedToday = !!userDawatiMojlishData.records[email]?.[today];
    return NextResponse.json({ isSubmittedToday }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new NextResponse("Failed to fetch data", { status: 500 });
  }
}
