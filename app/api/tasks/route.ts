import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const todoData = readTodoData();

    // ✅ Ensure 'date' is always in 'YYYY-MM-DD' format before sending
    const tasks = todoData.records.map((task) => ({
      ...task,
      date: new Date(task.date).toISOString().split("T")[0], // ✅ Fix incorrect format
    }));

    return NextResponse.json({ records: tasks }, { status: 200 });
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, time, visibility, description, date } = await req.json();

    if (!title || !time || !visibility || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { email, division, district, area, upazila, union } = session.user;
    const todoData = readTodoData();

    // ✅ Ensure correct datetime format
    const formattedDateTime = new Date(`${date}`).toISOString();

    const newTask: Task = {
      id: crypto.randomUUID(),
      email,
      date: formattedDateTime, // ✅ Store ISO formatted datetime
      title,
      time,
      visibility,
      description,
      division,
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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

    // ✅ Remove the task from the list
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
