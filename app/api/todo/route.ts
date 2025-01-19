import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const todoDataPath = path.join(process.cwd(), "app/data/todoData.json");

// Ensure the data file exists
if (!fs.existsSync(todoDataPath)) {
  fs.writeFileSync(
    todoDataPath,
    JSON.stringify({ records: [] }, null, 2),
    "utf-8"
  );
}

// Read Task Data
const readTodoData = (): { records: Task[] } => {
  try {
    const fileContent = fs.readFileSync(todoDataPath, "utf-8").trim();
    return fileContent ? JSON.parse(fileContent) : { records: [] };
  } catch (error) {
    console.error("Error reading todo data file:", error);
    return { records: [] };
  }
};

// Write Task Data
const writeTodoData = (data: { records: Task[] }) => {
  try {
    fs.writeFileSync(todoDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing todo data file:", error);
  }
};

// Task Interface
interface Task {
  email: string;
  date: string;
  title: string;
  time: string;
  visibility: string;
  description: string;
}

// ✅ GET: Fetch all tasks
export async function GET() {
  try {
    const todoData = readTodoData();
    return NextResponse.json({ records: todoData.records }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

// ✅ POST: Add a new task
export async function POST(req: NextRequest) {
  try {
    const { email, date, title, time, visibility, description } =
      await req.json();

    if (!email || !date || !title || !time || !visibility || !description) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const todoData = readTodoData();
    todoData.records.push({
      email,
      date,
      title,
      time,
      visibility,
      description,
    });
    writeTodoData(todoData);

    return NextResponse.json(
      { message: "Task added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to add task." }, { status: 500 });
  }
}

// ✅ DELETE: Remove a task
export async function DELETE(req: NextRequest) {
  try {
    const { email, date, title } = await req.json();

    if (!email || !date || !title) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    let todoData = readTodoData();
    todoData.records = todoData.records.filter(
      (task: Task) =>
        !(task.email === email && task.date === date && task.title === title)
    );
    writeTodoData(todoData);

    return NextResponse.json(
      { message: "Task deleted successfully" },
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
