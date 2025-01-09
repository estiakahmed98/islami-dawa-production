import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath = path.join(process.cwd(), "app/data/talimBisoyUserData.ts");

interface TalimBisoyData {
  [email: string]: {
    [date: string]: {
      mohilaTalim: string;
      TalimOngshoGrohon: string;
    };
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { mohilaTalim, TalimOngshoGrohon, email } = await req.json();

    console.log("Received data:", {
      mohilaTalim,
      TalimOngshoGrohon,
      email,
    });

    // Basic validation
    if (!email || !mohilaTalim || !TalimOngshoGrohon) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Read the existing user data file
    let fileContent = "{}";
    if (fs.existsSync(userDataPath)) {
      fileContent = fs.readFileSync(userDataPath, "utf-8");
    }

    // Parse existing data
    let userTalimBisoyData: TalimBisoyData = {};
    try {
      const startIndex = fileContent.indexOf("{");
      const endIndex = fileContent.lastIndexOf("}");
      if (startIndex !== -1 && endIndex !== -1) {
        const jsonString = fileContent.slice(startIndex, endIndex + 1);
        userTalimBisoyData = JSON.parse(jsonString);
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
    }

    // Ensure the user's data is organized by email
    if (!userTalimBisoyData[email]) {
      userTalimBisoyData[email] = {};
    }

    // Add form data under the current date
    userTalimBisoyData[email][currentDate] = {
      mohilaTalim,
      TalimOngshoGrohon,
    };

    // Write the updated userData back to the file
    const updatedFileContent = `export const userTalimBisoyData = ${JSON.stringify(
      userTalimBisoyData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return new NextResponse(
      JSON.stringify(userTalimBisoyData[email][currentDate]),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return new NextResponse("Failed to save user data", { status: 500 });
  }
}
