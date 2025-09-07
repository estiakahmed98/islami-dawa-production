// app/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { getServerAuthSession } from "@/lib/auth";

/** -----------------------------
 *  Local JSON storage
 *  (OK for dev; ephemeral on serverless)
 *  ----------------------------- */
const dataDir = path.join(process.cwd(), "app", "data");
const todoDataPath = path.join(dataDir, "todoData.json");

// ensure folder + file exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(todoDataPath)) {
  fs.writeFileSync(
    todoDataPath,
    JSON.stringify({ records: [] }, null, 2),
    "utf-8"
  );
}

/** -----------------------------
 *  Types
 *  ----------------------------- */
interface Task {
  id: string;
  email: string; // creator email
  creatorRole: string; // creator role
  date: string; // ISO
  title: string;
  time: string;
  visibility: "private" | "public";
  description: string;
  division?: string;
  district?: string;
  area?: string;
  upazila?: string;
  union?: string;
}

type SessionUser = {
  email: string;
  role: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  area?: string;
};

/** -----------------------------
 *  Helpers
 *  ----------------------------- */
function readTodoData(): { records: Task[] } {
  try {
    const raw = fs.readFileSync(todoDataPath, "utf-8").trim();
    return raw ? JSON.parse(raw) : { records: [] };
  } catch (e) {
    console.error("readTodoData error:", e);
    return { records: [] };
  }
}

function writeTodoData(data: { records: Task[] }) {
  try {
    fs.writeFileSync(todoDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("writeTodoData error:", e);
  }
}

function getMidnight(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** -----------------------------
 *  GET /api/todos
 *  ----------------------------- */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const viewer = session.user as SessionUser;

    const { records } = readTodoData();

    // visibility rules
    const visibleTasks = records.filter((task) => {
      if (task.visibility === "private") {
        return task.email === viewer.email;
      }

      const ownerRole = task.creatorRole;
      if (ownerRole === "centraladmin") return true;

      if (ownerRole === "divisionadmin") {
        if (viewer.role === "centraladmin") return true;
        return (
          task.division === viewer.division &&
          [
            "divisionadmin",
            "districtadmin",
            "upozilaadmin",
            "unionadmin",
            "daye",
          ].includes(viewer.role)
        );
      }

      if (ownerRole === "districtadmin") {
        if (viewer.role === "centraladmin") return true;
        return (
          task.district === viewer.district &&
          ["districtadmin", "upozilaadmin", "unionadmin", "daye"].includes(
            viewer.role
          )
        );
      }

      if (ownerRole === "upozilaadmin") {
        if (viewer.role === "centraladmin") return true;
        return (
          task.upazila === viewer.upazila &&
          ["upozilaadmin", "unionadmin", "daye"].includes(viewer.role)
        );
      }

      if (ownerRole === "unionadmin") {
        if (viewer.role === "centraladmin") return true;
        return (
          task.union === viewer.union &&
          ["unionadmin", "daye"].includes(viewer.role)
        );
      }

      // by spec, daye shouldn't publish public; if present, hide
      if (ownerRole === "daye") return false;

      return false;
    });

    return NextResponse.json({ records: visibleTasks }, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

/** -----------------------------
 *  POST /api/todos
 *  ----------------------------- */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const {
      title,
      time,
      visibility,
      description,
      date,
      division,
      district,
      area,
      upazila,
      union,
    } = await req.json();

    if (!title || !time || !visibility || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (user.role === "daye" && visibility === "public") {
      return NextResponse.json(
        { error: "Daye cannot create public tasks." },
        { status: 403 }
      );
    }

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 }
      );
    }

    // must be at least tomorrow (midnight)
    const nowMid = getMidnight(new Date());
    const tomorrowMid = new Date(nowMid);
    tomorrowMid.setDate(tomorrowMid.getDate() + 1);

    if (getMidnight(parsed) < tomorrowMid) {
      return NextResponse.json(
        {
          error:
            "Cannot post for past or today's date. Must be at least tomorrow.",
        },
        { status: 400 }
      );
    }

    const store = readTodoData();
    const newTask: Task = {
      id: randomUUID(),
      email: user.email!,
      creatorRole: user.role,
      date: parsed.toISOString(),
      title,
      time,
      visibility,
      description,
      division: division ?? user.division,
      district: district ?? user.district,
      area: area ?? user.area,
      upazila: upazila ?? user.upazila,
      union: union ?? user.union,
    };

    store.records.push(newTask);
    writeTodoData(store);

    return NextResponse.json(
      { message: "Task added successfully", task: newTask },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Failed to add task." }, { status: 500 });
  }
}

/** -----------------------------
 *  PUT /api/todos
 *  ----------------------------- */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { id, title, time, visibility, description, date } = await req.json();

    if (!id || !title || !time || !visibility || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (user.role === "daye" && visibility === "public") {
      return NextResponse.json(
        { error: "Daye cannot create/update public tasks." },
        { status: 403 }
      );
    }

    const store = readTodoData();
    const idx = store.records.findIndex((t) => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const existing = store.records[idx];
    // only owner (or allow centraladmin if desired)
    if (existing.email !== user.email) {
      return NextResponse.json(
        { error: "Unauthorized to update this task." },
        { status: 403 }
      );
    }

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 }
      );
    }

    // updates: date must be >= today
    const todayMid = getMidnight(new Date());
    if (getMidnight(parsed) < todayMid) {
      return NextResponse.json(
        { error: "Cannot edit a past date's task." },
        { status: 400 }
      );
    }

    store.records[idx] = {
      ...existing,
      title,
      time,
      visibility,
      description,
      date: parsed.toISOString(),
    };
    writeTodoData(store);

    return NextResponse.json(
      { message: "Task updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 }
    );
  }
}

/** -----------------------------
 *  DELETE /api/todos
 *  ----------------------------- */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as SessionUser;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required." },
        { status: 400 }
      );
    }

    const store = readTodoData();
    const idx = store.records.findIndex((t) => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const existing = store.records[idx];
    // allow creator or centraladmin to delete
    if (existing.email !== user.email && user.role !== "centraladmin") {
      return NextResponse.json(
        { error: "Unauthorized to delete this task." },
        { status: 403 }
      );
    }

    store.records.splice(idx, 1);
    writeTodoData(store);

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}
