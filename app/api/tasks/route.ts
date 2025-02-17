//Estiak

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth"; // Adjust path to your real auth helper
import { headers } from "next/headers";

// Path to your local JSON data file
const todoDataPath = path.join(process.cwd(), "app/data/todoData.json");

// Make sure the file exists
if (!fs.existsSync(todoDataPath)) {
  fs.writeFileSync(
    todoDataPath,
    JSON.stringify({ records: [] }, null, 2),
    "utf-8"
  );
}

// Task structure
interface Task {
  id: string;
  email: string; // who created
  creatorRole: string; // role of the creator
  date: string;
  title: string;
  time: string;
  visibility: string; // "private" or "public"
  description: string;
  division?: string;
  district?: string;
  area?: string;
  upazila?: string;
  union?: string;
}

function readTodoData(): { records: Task[] } {
  try {
    const fileContent = fs.readFileSync(todoDataPath, "utf-8").trim();
    return fileContent ? JSON.parse(fileContent) : { records: [] };
  } catch (error) {
    console.error("Error reading file:", error);
    return { records: [] };
  }
}

function writeTodoData(data: { records: Task[] }) {
  try {
    fs.writeFileSync(todoDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing file:", error);
  }
}

// A helper to get a date at midnight (00:00:00)
function getMidnight(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// =================== GET ===================
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const viewerEmail = session.user.email;
    const viewerRole = session.user.role as string; // Force to string
    const viewerDivision = session.user.division;
    const viewerDistrict = session.user.district;
    const viewerUpazila = session.user.upazila;
    const viewerUnion = session.user.union;

    const todoData = readTodoData();
    const { records } = todoData;

    // Filter tasks the user is allowed to see
    const visibleTasks = records.filter((task) => {
      // 1) Private => only the creator can see
      if (task.visibility === "private") {
        return task.email === viewerEmail;
      }

      // 2) Public => check the creator's role
      const ownerRole = task.creatorRole;
      if (ownerRole === "centraladmin") {
        // Visible to everyone
        return true;
      } else if (ownerRole === "divisionadmin") {
        // Visible to centraladmin, or if same division & role in allowed list
        if (viewerRole === "centraladmin") return true;
        return (
          task.division === viewerDivision &&
          [
            "divisionadmin",
            "districtadmin",
            "upozilaadmin",
            "unionadmin",
            "daye",
          ].includes(viewerRole)
        );
      } else if (ownerRole === "districtadmin") {
        // Visible to centraladmin, or same district & role in allowed list
        if (viewerRole === "centraladmin") return true;
        return (
          task.district === viewerDistrict &&
          ["districtadmin", "upozilaadmin", "unionadmin", "daye"].includes(
            viewerRole
          )
        );
      } else if (ownerRole === "upozilaadmin") {
        // Visible to centraladmin, or same upazila & role in allowed list
        if (viewerRole === "centraladmin") return true;
        return (
          task.upazila === viewerUpazila &&
          ["upozilaadmin", "unionadmin", "daye"].includes(viewerRole)
        );
      } else if (ownerRole === "unionadmin") {
        // Visible to centraladmin, or same union & role in allowed list
        if (viewerRole === "centraladmin") return true;
        return (
          task.union === viewerUnion &&
          ["unionadmin", "daye"].includes(viewerRole)
        );
      } else if (ownerRole === "daye") {
        // By your spec, daye shouldn't post public. If it exists, we hide it or show it?
        // We'll hide it for safety.
        return false;
      }
      // Fallback (shouldn't happen):
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

// =================== POST ===================
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
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

    // If daye tries to create public => block it
    if (user.role === "daye" && visibility === "public") {
      return NextResponse.json(
        { error: "Daye cannot create public tasks." },
        { status: 403 }
      );
    }

    // Validate date
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 }
      );
    }
    // For new post => date must be >= tomorrow
    const now = getMidnight(new Date()); // e.g. "Feb 1, 2025 00:00:00"
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1); // => "Feb 2, 2025 00:00:00"

    const desiredDateMidnight = getMidnight(parsed);
    if (desiredDateMidnight < tomorrow) {
      return NextResponse.json(
        {
          error:
            "Cannot post for past or today's date. Must be at least tomorrow.",
        },
        { status: 400 }
      );
    }

    // All good
    const safeDate = parsed.toISOString(); // keep the original time if needed, or just midnight

    const todoData = readTodoData();
    const newTask: Task = {
      id: crypto.randomUUID(),
      email: user.email,
      creatorRole: user.role as string, // store who created it
      date: safeDate,
      title,
      time,
      visibility, // "private" or "public"
      description,
      division: division ?? user.division,
      district: district ?? user.district,
      area: area ?? user.area,
      upazila: upazila ?? user.upazila,
      union: union ?? user.union,
    };

    todoData.records.push(newTask);
    writeTodoData(todoData);

    return NextResponse.json(
      {
        message: "Task added successfully",
        records: todoData.records,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Failed to add task." }, { status: 500 });
  }
}

// =================== PUT ===================
export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id,
      email,
      creatorRole,
      title,
      time,
      visibility,
      description,
      date,
    } = await req.json();

    if (
      !id ||
      !email ||
      !title ||
      !time ||
      !visibility ||
      !description ||
      !date
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // If daye tries to update a post to public => block
    if (session.user.role === "daye" && visibility === "public") {
      return NextResponse.json(
        { error: "Daye cannot create/update public tasks." },
        { status: 403 }
      );
    }

    const todoData = readTodoData();
    const index = todoData.records.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const existing = todoData.records[index];
    // Only the owner can update (or add a check for centraladmin if needed)
    if (existing.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized to update this task." },
        { status: 403 }
      );
    }

    // Validate date
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 }
      );
    }

    // For update => date must be >= today
    const today = getMidnight(new Date());
    const desiredDateMidnight = getMidnight(parsed);
    if (desiredDateMidnight < today) {
      return NextResponse.json(
        { error: "Cannot edit a past date's task." },
        { status: 400 }
      );
    }

    const safeDate = parsed.toISOString();

    todoData.records[index] = {
      ...existing,
      title,
      time,
      visibility,
      description,
      date: safeDate,
      // keep the original region and creatorRole
    };

    writeTodoData(todoData);
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

// =================== DELETE ===================
export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required." },
        { status: 400 }
      );
    }

    const todoData = readTodoData();
    const index = todoData.records.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const existing = todoData.records[index];
    // Only the owner can delete (if you want to let centraladmin do it, add condition)
    if (existing.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized to delete this task." },
        { status: 403 }
      );
    }

    todoData.records.splice(index, 1);
    writeTodoData(todoData);

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
