import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath = path.join(
  process.cwd(),
  "/src/app/data/moktobBisoyUserData.tsx"
);

interface UserMoktobBisoyData {
  [email: string]: {
    [date: string]: {
      MoktobChalu: number;
      MoktobAdmit: number;
      NewMoktob: number;
      Sikkha: number;
      TotalStudent: number;
      TotalSikkha: number;
      GurdianMeeting: number;
      TotalAgeSikkha: number;
      MadrasahAdmit: number;
      NewMuslim: number;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const {
      MoktobChalu,
      MoktobAdmit,
      NewMoktob,
      Sikkha,
      TotalStudent,
      TotalSikkha,
      GurdianMeeting,
      TotalAgeSikkha,
      MadrasahAdmit,
      NewMuslim,
      email,
    }: {
      MoktobChalu: number;
      MoktobAdmit: number;
      NewMoktob: number;
      Sikkha: number;
      TotalStudent: number;
      TotalSikkha: number;
      GurdianMeeting: number;
      TotalAgeSikkha: number;
      MadrasahAdmit: number;
      NewMuslim: number;
      email: string;
    } = await req.json();

    console.log("Received data:", {
      MoktobChalu,
      MoktobAdmit,
      NewMoktob,
      Sikkha,
      TotalStudent,
      TotalSikkha,
      GurdianMeeting,
      TotalAgeSikkha,
      MadrasahAdmit,
      NewMuslim,
      email,
    });

    // Basic validation
    if (
      !email ||
      MoktobChalu == null ||
      MoktobAdmit == null ||
      NewMoktob == null ||
      Sikkha == null ||
      TotalStudent == null ||
      TotalSikkha == null ||
      GurdianMeeting == null ||
      TotalAgeSikkha == null ||
      MadrasahAdmit == null ||
      NewMuslim == null
    ) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Read the existing user data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userMoktobBisoyData: UserMoktobBisoyData = {};
    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userMoktobBisoyData = eval(`(${jsonString})`);
    }

    // Ensure the user's data is organized by email
    if (!userMoktobBisoyData[email]) {
      userMoktobBisoyData[email] = {};
    }

    // Add form data under the current date
    userMoktobBisoyData[email][currentDate] = {
      MoktobChalu,
      MoktobAdmit,
      NewMoktob,
      Sikkha,
      TotalStudent,
      TotalSikkha,
      GurdianMeeting,
      TotalAgeSikkha,
      MadrasahAdmit,
      NewMuslim,
    };

    // Write the updated user data back to the file
    const updatedFileContent = `export const userMoktobBisoyData = ${JSON.stringify(
      userMoktobBisoyData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return NextResponse.json(
      { [email]: userMoktobBisoyData[email][currentDate] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return new NextResponse("Failed to save user data", { status: 500 });
  }
}
