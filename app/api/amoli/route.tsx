import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const userDataPath: string = path.join(
  process.cwd(),
  "app",
  "data",
  "amoliMuhasabaUserData"
);

interface UserData {
  tahajjud: string;
  ayat: string;
  zikir: string;
  ishraq: string;
  jamat: string;
  sirat: string;
  Dua: string;
  ilm: string;
  tasbih: string;
  dayeeAmol: string;
  amoliSura: string;
  ayamroja: string;
  hijbulBahar: string;
  email: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: UserData = await req.json();

    const {
      tahajjud,
      ayat,
      zikir,
      ishraq,
      jamat,
      sirat,
      Dua,
      ilm,
      tasbih,
      dayeeAmol,
      amoliSura,
      ayamroja,
      hijbulBahar,
      email,
    } = body;

    console.log("Received data:", body);

    if (
      !email ||
      !tahajjud ||
      !ayat ||
      !zikir ||
      !ishraq ||
      !jamat ||
      !sirat ||
      !Dua ||
      !ilm ||
      !tasbih ||
      !dayeeAmol ||
      !amoliSura ||
      !ayamroja ||
      !hijbulBahar
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const currentDate: string = new Date().toISOString().split("T")[0];

    const dataDir = path.dirname(userDataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(userDataPath)) {
      fs.writeFileSync(userDataPath, "{}"); // Create the file if it doesn't exist
    }
    const fileContent: string = fs.readFileSync(userDataPath, "utf-8");

    let userAmoliData: Record<string, Record<string, UserData>> = {};
    if (fileContent.trim()) {
      userAmoliData = JSON.parse(fileContent);
    }

    if (!userAmoliData[email]) {
      userAmoliData[email] = {};
    }

    userAmoliData[email][currentDate] = {
      tahajjud,
      ayat,
      zikir,
      ishraq,
      jamat,
      sirat,
      Dua,
      ilm,
      tasbih,
      dayeeAmol,
      amoliSura,
      ayamroja,
      hijbulBahar,
      email,
    };

    const updatedFileContent = JSON.stringify(userAmoliData, null, 2);
    fs.writeFileSync(userDataPath, updatedFileContent, "utf-8");

    console.log("Data saved under date:", currentDate);

    return NextResponse.json(userAmoliData[email][currentDate], {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to save user data" },
      { status: 500 }
    );
  }
}
