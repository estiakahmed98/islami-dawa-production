import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const todoDataPath = path.join(process.cwd(), "app/data/todoData.json");

// ✅ Ensure the data file exists
if (!fs.existsSync(todoDataPath)) {
  fs.writeFileSync(
    todoDataPath,
    JSON.stringify({ records: [] }, null, 2),
    "utf-8"
  );
}

// 📌 Task Interface
interface Task {
  id: string;
  email: string;
  date: string;
  title: string;
  time: string;
  visibility: string;
  description: string;
}

// 📌 Read Task Data
const readTodoData = (): { records: Task[] } => {
  try {
    const fileContent = fs.readFileSync(todoDataPath, "utf-8").trim();
    return fileContent ? JSON.parse(fileContent) : { records: [] };
  } catch (error) {
    console.error("Error reading todo data file:", error);
    return { records: [] };
  }
};

// 📌 Write Task Data
const writeTodoData = (data: { records: Task[] }) => {
  try {
    fs.writeFileSync(todoDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing todo data file:", error);
  }
};

// ✅ **GET: Fetch Tasks (Filtered by Email & Visibility)**
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const todoData = readTodoData();

    // ✅ Show private tasks of the logged-in user & all public tasks
    const filteredTasks = todoData.records.filter(
      (task) => task.email === email || task.visibility === "public"
    );

    return NextResponse.json({ records: filteredTasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

// ✅ **POST: Add a New Task**
export async function POST(req: NextRequest) {
  try {
    const { email, date, title, time, visibility, description } =
      await req.json();

    if (!email || !title || !time || !visibility || !description) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // ✅ Set today's date if date is not provided
    const taskDate = date || new Date().toISOString().split("T")[0];

    const todoData = readTodoData();

    const newTask: Task = {
      id: uuidv4(), // Assign unique ID
      email,
      date: taskDate,
      title,
      time,
      visibility,
      description,
    };

    todoData.records.push(newTask);
    writeTodoData(todoData);

    return NextResponse.json(
      { message: "Task added successfully", records: todoData.records },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to add task." }, { status: 500 });
  }
}

// ✅ **PUT: Update an Existing Task**
export async function PUT(req: NextRequest) {
  try {
    const { id, email, date, title, time, visibility, description } =
      await req.json();

    if (
      !id ||
      !email ||
      !date ||
      !title ||
      !time ||
      !visibility ||
      !description
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    let todoData = readTodoData();
    let updated = false;

    // ✅ Find and update task using ID
    todoData.records = todoData.records.map((task) => {
      if (task.id === id) {
        updated = true;
        return { id, email, date, title, time, visibility, description }; // Updated task
      }
      return task;
    });

    if (!updated) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    writeTodoData(todoData);
    return NextResponse.json(
      { message: "Task updated successfully", records: todoData.records },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 }
    );
  }
}

// ✅ **DELETE: Remove a Task**
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required." },
        { status: 400 }
      );
    }

    let todoData = readTodoData();
    const initialLength = todoData.records.length;

    // ✅ Remove task using ID
    todoData.records = todoData.records.filter((task) => task.id !== id);

    if (todoData.records.length === initialLength) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    writeTodoData(todoData);

    return NextResponse.json(
      { message: "Task deleted successfully", records: todoData.records },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing delete request:", error);
    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}
