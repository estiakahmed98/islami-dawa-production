//api/amoli
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const {
      email,
      percentage = "0",
      editorContent = "",
      tahajjud,
      surah,
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
      quarntilawat,
    } = body;

    // quarntilawat is already the JSON object from the form

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!tahajjud && !surah && !zikir && !ishraq && !jamat && !sirat && !Dua && !ilm && !tasbih && !dayeeAmol && !amoliSura && !ayamroja && !hijbulBahar) {
      return NextResponse.json(
        { error: "At least one field must be filled." },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();

    const existing = await prisma.amoliMuhasaba.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already submitted today." },
        { status: 400 }
      );
    }

    // Whitelist fields that exist on the Prisma model to avoid passing unknown keys
    const created = await prisma.amoliMuhasaba.create({
      data: {
        userId: user.id,
        date: today,
        percentage: percentage ?? undefined,
        editorContent: editorContent ?? undefined,
        tahajjud: typeof tahajjud !== "undefined" && tahajjud !== null ? Number(tahajjud) : undefined,
        surah: surah ?? undefined,
        ayat: ayat ?? undefined,
        quarntilawat: typeof quarntilawat !== "undefined" ? quarntilawat : undefined,
        zikir: zikir ?? undefined,
        ishraq: ishraq ?? undefined,
        jamat: typeof jamat !== "undefined" && jamat !== null ? Number(jamat) : undefined,
        sirat: sirat ?? undefined,
        Dua: Dua ?? undefined,
        ilm: ilm ?? undefined,
        tasbih: tasbih ?? undefined,
        dayeeAmol: dayeeAmol ?? undefined,
        amoliSura: amoliSura ?? undefined,
        ayamroja: ayamroja ?? undefined,
        hijbulBahar: hijbulBahar ?? undefined,
      },
    });

    return NextResponse.json(
      { message: "Submitted", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/amoli error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailsParam = searchParams.get("emails");
    const email = searchParams.get("email");

    let emailList: string[] = [];
    if (emailsParam) {
      emailList = emailsParam.split(",").map(e => e.trim());
    } else if (email) {
      emailList = [email];
    } else {
      return NextResponse.json({ error: "Emails or email is required." }, { status: 400 });
    }

    const records: Record<string, any[]> = {};

    for (const em of emailList) {
      const user = await prisma.users.findUnique({ where: { email: em } });
      if (!user) {
        records[em] = [];
        continue;
      }

      const userRecords = await prisma.amoliMuhasaba.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" },
      });

      records[em] = userRecords;
    }

    if (emailsParam) {
      // Multiple emails: return { records: { email: array } }
      return NextResponse.json({ records }, { status: 200 });
    } else {
      // Single email: return { records: array }
      return NextResponse.json({ records: records[email!] }, { status: 200 });
    }
  } catch (error) {
    console.error("GET /api/amoli error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}





export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, quarntilawat, ...data } = body;

      // Only allow updating known fields to avoid Prisma validation errors
      if (!email || Object.keys(data).length === 0) {
        return NextResponse.json({ error: "Email and data are required." }, { status: 400 });
      }

      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const today = new Date();

      const updatePayload: any = {};
      const allowedUpdateFields = [
        "percentage",
        "editorContent",
        "tahajjud",
        "surah",
        "ayat",
        "quarntilawat",
        "zikir",
        "ishraq",
        "jamat",
        "sirat",
        "Dua",
        "ilm",
        "tasbih",
        "dayeeAmol",
        "amoliSura",
        "ayamroja",
        "hijbulBahar",
      ];

      for (const key of allowedUpdateFields) {
        if (key in data) {
          // coerce numeric fields where appropriate
          if (key === "tahajjud" || key === "jamat") {
            updatePayload[key] = data[key] !== null && data[key] !== undefined ? Number(data[key]) : null;
          } else {
            updatePayload[key] = data[key];
          }
        }
      }

      if (quarntilawat) updatePayload.quarntilawat = quarntilawat;

      const updated = await prisma.amoliMuhasaba.update({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
        data: updatePayload,
      });

    return NextResponse.json({ message: "Updated successfully", data: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Update failed. Possibly not submitted yet." }, { status: 500 });
  }
}
