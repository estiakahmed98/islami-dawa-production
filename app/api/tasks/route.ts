import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/auth-client";

const todoDataPath = path.join(process.cwd(), "app/data/todoData.json");

if (!fs.existsSync(todoDataPath)) {
  fs.writeFileSync(
    todoDataPath,
    JSON.stringify({ records: [] }, null, 2),
    "utf-8"
  );
}

interface Task {
  id: string;
  email: string;
  date: string;
  title: string;
  time: string;
  visibility: string;
  description: string;
  division?: string;
  district?: string;
  area?: string;
  upazila?: string;
  union?: string;
}

const readTodoData = (): { records: Task[] } => {
  try {
    const fileContent = fs.readFileSync(todoDataPath, "utf-8").trim();
    return fileContent ? JSON.parse(fileContent) : { records: [] };
  } catch (error) {
    console.error("Error reading todo data file:", error);
    return { records: [] };
  }
};

const writeTodoData = (data: { records: Task[] }) => {
  try {
    fs.writeFileSync(todoDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing todo data file:", error);
  }
};

export async function GET() {
  try {
    const { data: session } = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { role, division, district, upazila, union } = session.user;
    const todoData = readTodoData();

    let visibleTasks: Task[] = [];

    if (role === "centraladmin") {
      visibleTasks = todoData.records;
    } else if (role === "divisionadmin") {
      visibleTasks = todoData.records.filter(
        (task) =>
          task.division === division &&
          [
            "divisionadmin",
            "districtadmin",
            "upozilaadmin",
            "unionadmin",
            "daye",
          ].includes(task.visibility)
      );
    } else if (role === "districtadmin") {
      visibleTasks = todoData.records.filter(
        (task) =>
          task.district === district &&
          ["districtadmin", "upozilaadmin", "unionadmin", "daye"].includes(
            task.visibility
          )
      );
    } else if (role === "upozilaadmin") {
      visibleTasks = todoData.records.filter(
        (task) =>
          task.upazila === upazila &&
          ["upozilaadmin", "unionadmin", "daye"].includes(task.visibility)
      );
    } else if (role === "unionadmin") {
      visibleTasks = todoData.records.filter(
        (task) =>
          task.union === union &&
          ["unionadmin", "daye"].includes(task.visibility)
      );
    } else {
      visibleTasks = todoData.records.filter(
        (task) => task.visibility === "public"
      );
    }

    return NextResponse.json({ records: visibleTasks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { data: session } = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Extract user location data from session
    const { email, division, district, area, upazila, union } = session.user;

    // ✅ Extract other task data from request body
    const { title, time, visibility, description } = await req.json();

    // ✅ Validate required fields
    if (!title || !time || !visibility || !description) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const todoData = readTodoData();

    const newTask: Task = {
      id: crypto.randomUUID(),
      email, // ✅ Automatically assign from session
      date: new Date().toISOString().split("T")[0], // ✅ Auto-assign today's date
      title,
      time,
      visibility,
      description,
      division, // ✅ Auto-assign from session
      district,
      area,
      upazila,
      union,
    };

    todoData.records.push(newTask);
    writeTodoData(todoData);

    return NextResponse.json(
      { message: "Task added successfully", records: todoData.records },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json({ error: "Failed to add task." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { data: session } = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, email, title, time, visibility, description } =
      await req.json();
    if (!id || !email || !title || !time || !visibility || !description) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const todoData = readTodoData();
    const taskIndex = todoData.records.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    if (todoData.records[taskIndex].email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized to update this task." },
        { status: 403 }
      );
    }

    todoData.records[taskIndex] = {
      ...todoData.records[taskIndex],
      title,
      time,
      visibility,
      description,
    };
    writeTodoData(todoData);

    return NextResponse.json(
      { message: "Task updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { data: session } = await getSession();
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
    const taskIndex = todoData.records.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    if (todoData.records[taskIndex].email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized to delete this task." },
        { status: 403 }
      );
    }

    todoData.records.splice(taskIndex, 1);
    writeTodoData(todoData);

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}
