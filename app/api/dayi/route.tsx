// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";

// const userDataPath = path.join(process.cwd(), "app/data/dayiUserData.ts");

// interface UserDayeData {
//   [email: string]: {
//     [date: string]: {
//       sohojogiDayeToiri: string;
//     };
//   };
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { sohojogiDayeToiri, email }: { sohojogiDayeToiri: string; email: string } = await req.json();

//     console.log("Received data:", {
//       sohojogiDayeToiri,
//       email,
//     });

//     // Basic validation
//     if (!email || !sohojogiDayeToiri) {
//       return new NextResponse("All fields are required", { status: 400 });
//     }

//     // Get the current date in YYYY-MM-DD format
//     const currentDate = new Date().toISOString().split("T")[0];

//     // Read the existing user data file
//     let fileContent = "{}";
//     if (fs.existsSync(userDataPath)) {
//       fileContent = fs.readFileSync(userDataPath, "utf-8");
//     }

//     // Parse existing data
//     let userDayeData: UserDayeData = {};
//     try {
//       const startIndex = fileContent.indexOf("{");
//       const endIndex = fileContent.lastIndexOf("}");
//       if (startIndex !== -1 && endIndex !== -1) {
//         const jsonString = fileContent.slice(startIndex, endIndex + 1);
//         userDayeData = JSON.parse(jsonString);
//       }
//     } catch (e) {
//       console.error("Error parsing JSON:", e);
//     }

//     // Ensure the user's data is organized by email
//     if (!userDayeData[email]) {
//       userDayeData[email] = {};
//     }

//     // Add form data under the current date
//     userDayeData[email][currentDate] = {
//       sohojogiDayeToiri,
//     };

//     // Write the updated user data back to the file
//     const updatedFileContent = `export const userDayeData = ${JSON.stringify(
//       userDayeData,
//       null,
//       2
//     )};`;
//     fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

//     console.log("Data saved under date:", currentDate);
//     return NextResponse.json({ [email]: userDayeData[email][currentDate] }, { status: 201 });
//   } catch (error) {
//     console.error("Error saving data:", error);
//     return new NextResponse("Failed to save user data", { status: 500 });
//   }
// }

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

// Path to the user data file
const userDataPath = path.join(process.cwd(), "app/data/dayiUserData.ts");

// Type definitions
interface UserDayeData {
  [key: string]: string | number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, ...data } = body as UserDayeData & { email: string };

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
        `export const userDayeData = { labelMap: {}, records: {} };`,
        "utf-8"
      );
    }

    // Read the existing data file
    const fileContent = fs.readFileSync(userDataPath, "utf-8");

    // Parse existing data
    let userDayeData: {
      labelMap: object;
      records: Record<string, Record<string, UserDayeData>>;
    } = {
      labelMap: {},
      records: {},
    };

    const startIndex = fileContent.indexOf("{");
    const endIndex = fileContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = fileContent.slice(startIndex, endIndex + 1);
      userDayeData = eval(`(${jsonString})`);
    }

    // Ensure `records` key exists
    if (!userDayeData.records) {
      userDayeData.records = {};
    }

    // Ensure data is organized by email
    if (!userDayeData.records[email]) {
      userDayeData.records[email] = {};
    }

    // Add form data under the current date
    userDayeData.records[email][currentDate] = {
      ...userDayeData.records[email][currentDate], // Preserve existing data for the date
      ...data, // Merge new data
    };

    // Write the updated data back to the file
    const updatedFileContent = `export const userDayeData = ${JSON.stringify(
      userDayeData,
      null,
      2
    )};`;
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

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
