import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath = path.join(
  process.cwd(),
  "app/data/jamatBisoyUserData.ts"
);

interface UserJamatBisoyData {
  [email: string]: {
    [date: string]: {
      jamatBerHoise: number;
      jamatSathi: number;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const {
      jamatBerHoise,
      jamatSathi,
      email,
    }: { jamatBerHoise: number; jamatSathi: number; email: string } = await req.json();

    console.log("Received data:", {
      jamatBerHoise,
      jamatSathi,
      email,
    });

    // Basic validation
    if (!email || jamatBerHoise == null || jamatSathi == null) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Read the existing user data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userJamatBisoyUserData: UserJamatBisoyData = {};
    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userJamatBisoyUserData = eval(`(${jsonString})`);
    }

    // Ensure the user's data is organized by email
    if (!userJamatBisoyUserData[email]) {
      userJamatBisoyUserData[email] = {};
    }

    // Add form data under the current date
    userJamatBisoyUserData[email][currentDate] = {
      jamatBerHoise,
      jamatSathi,
    };

    // Write the updated user data back to the file
    const updatedFileContent = `export const userJamatBisoyUserData = ${JSON.stringify(
      userJamatBisoyUserData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return NextResponse.json({ [email]: userJamatBisoyUserData[email][currentDate] }, { status: 201 });
  } catch (error) {
    console.error("Error saving data:", error);
    return new NextResponse("Failed to save user data", { status: 500 });
  }
}
