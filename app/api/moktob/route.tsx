import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath = path.join(
  process.cwd(),
  "app/data/moktobBisoyUserData.ts"
);

type MoktobBisoyData = {
  MoktobChalu: string;
  MoktobAdmit: string;
  NewMoktob: string;
  Sikkha: string;
  TotalStudent: string;
  TotalSikkha: string;
  GurdianMeeting: string;
  TotalAgeSikkha: string;
  MadrasahAdmit: string;
  NewMuslim: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
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
    } = body as MoktobBisoyData & { email: string };

    console.log("Received data:", body);

    // Basic validation
    if (
      !email ||
      !MoktobChalu ||
      !MoktobAdmit ||
      !NewMoktob ||
      !Sikkha ||
      !TotalStudent ||
      !TotalSikkha ||
      !GurdianMeeting ||
      !TotalAgeSikkha ||
      !MadrasahAdmit ||
      !NewMuslim
    ) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Check if the file exists; if not, initialize it
    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(
        userDataPath,
        `export const userMoktobBisoyData = {};`,
        "utf-8"
      );
    }

    // Read the existing user data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userMoktobBisoyData: Record<
      string,
      Record<string, MoktobBisoyData>
    > = {};
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

    // Write the updated userData back to the file
    const updatedFileContent = `export const userMoktobBisoyData = ${JSON.stringify(
      userMoktobBisoyData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);
    return new NextResponse(
      JSON.stringify(userMoktobBisoyData[email][currentDate]),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to save user data", { status: 500 });
  }
}
