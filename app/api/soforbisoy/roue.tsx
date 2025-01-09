import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath = path.join(process.cwd(), "/src/app/data/userSoforBisoyData.ts");

export async function POST(req: NextRequest) {
  try {
    const { madrasaVisit, moktobVisit, schoolCollegeVisit, email } = await req.json();

    console.log("Received data:", {
      madrasaVisit,
      moktobVisit,
      schoolCollegeVisit,
      email,
    });

    // Basic validation
    if (!email || !madrasaVisit || !moktobVisit || !schoolCollegeVisit) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Read the existing user data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userSoforBisoyData: Record<string, any> = {};
    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userSoforBisoyData = JSON.parse(jsonString); // Safely parse JSON
    }

    // Ensure the user's data is organized by email
    if (!userSoforBisoyData[email]) {
      userSoforBisoyData[email] = {};
    }

    // Add form data under the current date
    userSoforBisoyData[email][currentDate] = {
      madrasaVisit,
      moktobVisit,
      schoolCollegeVisit,
    };

    // Write the updated userData back to the file
    const updatedFileContent = `export const userSoforBisoyData = ${JSON.stringify(
      userSoforBisoyData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return NextResponse.json(userSoforBisoyData[email][currentDate], { status: 201 });
  } catch (error) {
    console.error("Error saving user data:", error);
    return NextResponse.json({ error: "Failed to save user data" }, { status: 500 });
  }
}
