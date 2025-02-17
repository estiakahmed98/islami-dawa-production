//Juwel

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Path to the TypeScript data file
const userDataPath = path.join(
  process.cwd(),
  "app/data/amoliMuhasabaUserData.ts"
);

// Type definitions
interface UserAmoliData {
  tahajjud?: string;
  surah?: string;
  ayat?: string;
  zikir?: string;
  ishraq?: string;
  jamat?: string;
  sirat?: string;
  Dua?: string;
  ilm?: string;
  tasbih?: string;
  dayeeAmol?: string;
  amoliSura?: string;
  ayamroja?: string;
  hijbulBahar?: string;
  percentage?: string;
  [key: string]: string | undefined;
}

// Helper function to parse the TypeScript data file
const parseTsFile = (
  filePath: string
): { records: Record<string, Record<string, UserAmoliData>> } => {
  if (!fs.existsSync(filePath)) {
    return { records: {} };
  }
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const startIndex = fileContent.indexOf("{");
  const endIndex = fileContent.lastIndexOf("}");
  if (startIndex !== -1 && endIndex !== -1) {
    const jsonString = fileContent.slice(startIndex, endIndex + 1);
    return eval(`(${jsonString})`);
  }
  return { records: {} };
};

// Helper function to write data back to the TypeScript file
const writeTsFile = (
  filePath: string,
  data: { records: Record<string, Record<string, UserAmoliData>> }
) => {
  const tsContent = `export const userAmoliData = ${JSON.stringify(
    data,
    null,
    2
  )};`;
  fs.writeFileSync(filePath, tsContent, "utf-8");
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as UserAmoliData & { email: string };

    console.log("Received data:", body);

    // Basic validation
    if (!email || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Email and data are required." },
        { status: 400 }
      );
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Parse the existing data from the TypeScript file
    const userAmoliData = parseTsFile(userDataPath);

    // Check if the user has already submitted data today
    if (userAmoliData.records[email]?.[currentDate]) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // Ensure data is organized by email
    if (!userAmoliData.records[email]) {
      userAmoliData.records[email] = {};
    }

    // Add form data under the current date
    userAmoliData.records[email][currentDate] = data;

    // Write the updated data back to the TypeScript file
    writeTsFile(userDataPath, userAmoliData);

    console.log("Data saved under date:", currentDate);
    return NextResponse.json(
      {
        message: "Submission successful",
        data: userAmoliData.records[email][currentDate],
      },
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { error: "Failed to save user data." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const today = new Date().toISOString().split("T")[0];

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Parse the existing data from the TypeScript file
    const userAmoliData = parseTsFile(userDataPath);

    // Check if the user has submitted data today
    const isSubmittedToday = !!userAmoliData.records[email]?.[today];

    return NextResponse.json({ isSubmittedToday }, { status: 200 });
  } catch (error) {
    console.error("Error checking submission status:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission status." },
      { status: 500 }
    );
  }
}
