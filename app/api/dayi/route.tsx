import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Path to the user data file
const userDataPath = path.join(process.cwd(), "app/data/dayiUserData.ts");
const assistantDataPath = path.join(
  process.cwd(),
  "app/data/assistantDaeeData.ts"
);

// Type definitions
interface UserDayeData {
  [key: string]: string | number;
}

interface AssistantDaee {
  name: string;
  phone: string;
  address: string;
}

interface FormData {
  email: string;
  editorContent?: string;
  assistants?: AssistantDaee[];
  userInfo?: {
    email: string;
    division: string;
    district: string;
    upazila: string;
    union: string;
  };
  [key: string]: string | number | boolean | object | undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, assistants, userInfo, ...data } = body as FormData;

    console.log("Received data:", body);

    // Basic validation
    if (!email || Object.keys(data).length === 0) {
      return new NextResponse("Email and data are required", { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Check if the data file exists; if not, create it
    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(
        userDataPath,
        `export const userDayeData = { records: {} };`,
        "utf-8"
      );
    }

    // Read the existing data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");
    const userDayeData = eval(
      `(${fileContent.slice(
        fileContent.indexOf("{"),
        fileContent.lastIndexOf("}") + 1
      )})`
    );

    // Ensure data is organized by email
    if (!userDayeData.records[email]) {
      userDayeData.records[email] = {};
    }

    // Check if the user has already submitted today
    if (userDayeData.records[email][currentDate]) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // Add form data under the current date
    userDayeData.records[email][currentDate] = { ...data };

    // Write the updated data back to the file
    fs.writeFileSync(
      userDataPath,
      `export const userDayeData = ${JSON.stringify(userDayeData, null, 2)};`,
      "utf-8"
    );

    // Save assistant daee data if exists
    if (assistants && assistants.length > 0 && userInfo) {
      let assistantDaeeData = { records: {} };

      // Check if assistant data file exists
      if (fs.existsSync(assistantDataPath)) {
        const assistantFileContent = fs.readFileSync(
          assistantDataPath,
          "utf-8"
        );
        assistantDaeeData = eval(
          `(${assistantFileContent.slice(
            assistantFileContent.indexOf("{"),
            assistantFileContent.lastIndexOf("}") + 1
          )})`
        );
      }

      // Add assistant data with user info
      assistants.forEach((assistant, index) => {
        const assistantKey = `${email}_${currentDate}_${index}`;
        assistantDaeeData.records[assistantKey] = {
          ...assistant,
          ...userInfo,
          date: currentDate,
          mainDaeeEmail: email,
        };
      });

      // Write assistant data back to file
      fs.writeFileSync(
        assistantDataPath,
        `export const assistantDaeeData = ${JSON.stringify(assistantDaeeData, null, 2)};`,
        "utf-8"
      );
    }

    console.log("Data saved under date:", currentDate);
    return new NextResponse(
      JSON.stringify(userDayeData.records[email][currentDate]),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return new NextResponse("Failed to save user data", { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
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
    const userDayeData = eval(
      `(${fileContent.slice(
        fileContent.indexOf("{"),
        fileContent.lastIndexOf("}") + 1
      )})`
    );

    const isSubmittedToday = !!userDayeData.records[email]?.[today];
    return NextResponse.json({ isSubmittedToday }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new NextResponse("Failed to fetch user data", { status: 500 });
  }
}
