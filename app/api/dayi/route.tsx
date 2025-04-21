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

//---------------------------------Database------------------------------------------------------//

// import { type NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     // Verify request has body
//     if (!req.body) {
//       return NextResponse.json(
//         { error: "Request body is required" },
//         { status: 400 }
//       );
//     }

//     const body = await req.json();

//     // Validate required fields
//     const requiredFields = ["email", "sohojogiDayeToiri"];
//     const missingFields = requiredFields.filter((field) => !body[field]);

//     if (missingFields.length > 0) {
//       return NextResponse.json(
//         { error: `Missing required fields: ${missingFields.join(", ")}` },
//         { status: 400 }
//       );
//     }

//     const {
//       email,
//       assistants = [],
//       editorContent = "",
//       sohojogiDayeToiri,
//     } = body;

//     // Validate assistant data if present
//     if (assistants.length > 0) {
//       const invalidAssistants = assistants.some(
//         (a: any) => !a.name || !a.phone || !a.address
//       );

//       if (invalidAssistants) {
//         return NextResponse.json(
//           { error: "All assistants must have name, phone, and address" },
//           { status: 400 }
//         );
//       }
//     }

//     const currentDate = new Date().toISOString().split("T")[0];

//     // Check for existing submission
//     const existingSubmission = await db.dayeeBishoy.findUnique({
//       where: {
//         email_date: {
//           email,
//           date: currentDate,
//         },
//       },
//     });

//     if (existingSubmission) {
//       return NextResponse.json(
//         { error: "You have already submitted today" },
//         { status: 400 }
//       );
//     }

//     // Create the record with transaction
//     const result = await db.$transaction(async (tx) => {
//       const dayeeBishoyRecord = await tx.dayeeBishoy.create({
//         data: {
//           email,
//           date: currentDate,
//           editorContent,
//           sohojogiDayeToiri: Number(sohojogiDayeToiri) || 0,
//         },
//       });

//       if (assistants.length > 0) {
//         await tx.assistantDaee.createMany({
//           data: assistants.map((assistant: any) => ({
//             name: assistant.name,
//             phone: assistant.phone,
//             address: assistant.address,
//             description: assistant.description || "",
//             date: currentDate,
//             mainDaeeEmail: email,
//             division: body.userInfo?.division || "",
//             district: body.userInfo?.district || "",
//             upazila: body.userInfo?.upazila || "",
//             union: body.userInfo?.union || "",
//             dayeeBishoyId: dayeeBishoyRecord.id,
//           })),
//         });
//       }

//       return dayeeBishoyRecord;
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         data: {
//           id: result.id,
//           date: result.date,
//           assistantCount: assistants.length,
//         },
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error("Database error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to save data",
//         details:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       { status: 500 }
//     );
//   }
// }
