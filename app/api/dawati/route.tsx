//Juwel

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Path to the user data file
const userDataPath = path.join(
  process.cwd(),
  "app/data/dawatiBisoyUserData.ts"
);

// Type definitions
interface DawatiBisoyData {
  [key: string]: string | number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as DawatiBisoyData & { email: string };

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
        `export const userDawatiBisoyData = { records: {} };`,
        "utf-8"
      );
    }

    // Read the existing data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");
    const userDawatiBisoyData = eval(
      `(${fileContent.slice(
        fileContent.indexOf("{"),
        fileContent.lastIndexOf("}") + 1
      )})`
    );

    // Ensure data is organized by email
    if (!userDawatiBisoyData.records[email]) {
      userDawatiBisoyData.records[email] = {};
    }

    // Check if the user has already submitted today
    if (userDawatiBisoyData.records[email][currentDate]) {
      return NextResponse.json(
        { error: "You have already submitted data today." },
        { status: 400 }
      );
    }

    // Add form data under the current date
    userDawatiBisoyData.records[email][currentDate] = { ...data };

    // Write the updated data back to the file
    fs.writeFileSync(
      userDataPath,
      `export const userDawatiBisoyData = ${JSON.stringify(
        userDawatiBisoyData,
        null,
        2
      )};`,
      "utf-8"
    );

    console.log("Data saved under date:", currentDate);
    return NextResponse.json(
      { message: "Submission successful" },
      { status: 201 }
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
    const userDawatiBisoyData = eval(
      `(${fileContent.slice(
        fileContent.indexOf("{"),
        fileContent.lastIndexOf("}") + 1
      )})`
    );

    const isSubmittedToday = !!userDawatiBisoyData.records[email]?.[today];
    return NextResponse.json({ isSubmittedToday }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new NextResponse("Failed to fetch data", { status: 500 });
  }
}

// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";

// // Path to the user data file
// const userDataPath = path.join(
//   process.cwd(),
//   "app/data/dawatiBisoyUserData.ts"
// );

// // Type definitions
// interface DawatiBisoyData {
//   [key: string]: string | number;
// }

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const body = await req.json();
//     const { email, ...data } = body as DawatiBisoyData & { email: string };

//     console.log("Received data:", body);

//     // Basic validation
//     if (!email || Object.keys(data).length === 0) {
//       return new NextResponse("Email and data are required", { status: 400 });
//     }

//     // Get the current date in YYYY-MM-DD format
//     const currentDate = new Date().toISOString().split("T")[0];

//     // Check if the data file exists; if not, create it
//     if (!fs.existsSync(userDataPath)) {
//       fs.writeFileSync(
//         userDataPath,
//         `export const userDawatiBisoyData = { labelMap: {}, records: {} };`,
//         "utf-8"
//       );
//     }

//     // Read the existing data file
//     const fileContent = fs.readFileSync(userDataPath, "utf-8");

//     // Parse existing data
//     let userDawatiBisoyData: {
//       labelMap: object;
//       records: Record<string, Record<string, DawatiBisoyData>>;
//     } = {
//       labelMap: {},
//       records: {},
//     };

//     const startIndex = fileContent.indexOf("{");
//     const endIndex = fileContent.lastIndexOf("}");
//     if (startIndex !== -1 && endIndex !== -1) {
//       const jsonString = fileContent.slice(startIndex, endIndex + 1);
//       userDawatiBisoyData = eval(`(${jsonString})`);
//     }

//     // Ensure `records` key exists
//     if (!userDawatiBisoyData.records) {
//       userDawatiBisoyData.records = {};
//     }

//     // Ensure data is organized by email
//     if (!userDawatiBisoyData.records[email]) {
//       userDawatiBisoyData.records[email] = {};
//     }

//     // Add form data under the current date
//     userDawatiBisoyData.records[email][currentDate] = {
//       ...userDawatiBisoyData.records[email][currentDate], // Preserve existing data for the date
//       ...data, // Merge new data
//     };

//     // Write the updated data back to the file
//     const updatedFileContent = `export const userDawatiBisoyData = ${JSON.stringify(
//       userDawatiBisoyData,
//       null,
//       2
//     )};`;
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     console.log("Data saved under date:", currentDate);
//     return new NextResponse(
//       JSON.stringify(userDawatiBisoyData.records[email][currentDate]),
//       {
//         status: 201,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   } catch (error) {
//     console.error("Error saving data:", error);
//     return new NextResponse("Failed to save user data", { status: 500 });
//   }
// }
