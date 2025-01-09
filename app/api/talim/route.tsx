import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath = path.join(process.cwd(), "/src/app/data/talimBisoyUserData.ts");

export async function POST(req: NextRequest) {
  try {
    const { mohilaTalim, TalimOngshoGrohon, email } = await req.json();

    console.log("Received data:", {
      mohilaTalim,
      TalimOngshoGrohon,
      email,
    });

    // Basic validation
    if (!email || !mohilaTalim || !TalimOngshoGrohon) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Read the existing user data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userTalimData: Record<string, any> = {};
    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userTalimData = JSON.parse(jsonString); // Safely parse JSON
    }

    // Ensure the user's data is organized by email
    if (!userTalimData[email]) {
      userTalimData[email] = {};
    }

    // Add form data under the current date
    userTalimData[email][currentDate] = {
      mohilaTalim,
      TalimOngshoGrohon,
    };

    // Write the updated userTalimData back to the file
    const updatedFileContent = `export const userTalimData = ${JSON.stringify(
      userTalimData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return NextResponse.json({ email, currentDate }, { status: 201 });
  } catch (error) {
    console.error("Error saving user data:", error);
    return NextResponse.json({ error: "Failed to save user data" }, { status: 500 });
  }
}
