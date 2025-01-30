import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Path to the JSON file storing task data
const todoDataPath = path.join(process.cwd(), "app/data/todoData.json");

// Ensure the data file exists
if (!fs.existsSync(todoDataPath)) {
  fs.writeFileSync(
    todoDataPath,
    JSON.stringify({ records: [] }, null, 2),
    "utf-8"
  );
}

// Task Interface
interface Task {
  id: string;
  email: string;
  date: string;
  title: string;
  time: string;
  visibility: string;
  description: string;
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

// GET: Fetch Tasks
export async function GET() {
  try {
    const todoData = readTodoData();
    return NextResponse.json({ records: todoData.records }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

// POST: Add a New Task
export async function POST(request: Request) {
  try {
    const { email, date, title, time, visibility, description } =
      await request.json();

    if (!email || !title || !time || !visibility || !description) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const todoData = readTodoData();

    const newTask: Task = {
      id: crypto.randomUUID(), // More robust unique ID
      email,
      date: date || new Date().toISOString().split("T")[0],
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
