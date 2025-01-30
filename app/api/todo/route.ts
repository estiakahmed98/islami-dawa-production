import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

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
  division?: string;
  district?: string;
  area?: string;
  upozila?: string;
  union?: string;
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

// Google Calendar API Setup
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Load credentials from the JSON file
const credentials = require("@/utility/credentials.json");

// Create an OAuth2 client
const oAuth2Client = new OAuth2Client(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

// Function to get an authorized client
const getAuthorizedClient = async (): Promise<OAuth2Client> => {
  const token = await fs.promises.readFile("path/to/token.json");
  oAuth2Client.setCredentials(JSON.parse(token.toString()));
  return oAuth2Client;
};

// Function to create a Google Calendar event
const createGoogleCalendarEvent = async (calendarId: string, task: Task) => {
  const auth = await getAuthorizedClient();
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary: task.title,
    description: task.description,
    start: {
      date: task.date,
      timeZone: "UTC",
    },
    end: {
      date: task.date,
      timeZone: "UTC",
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  return response.data;
};

// Function to delete a Google Calendar event
const deleteGoogleCalendarEvent = async (
  calendarId: string,
  eventId: string
) => {
  const auth = await getAuthorizedClient();
  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.delete({
    calendarId,
    eventId,
  });
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

    // Filter tasks based on role and hierarchy
    const filteredTasks = todoData.records.filter((task) => {
      if (task.visibility === "public") {
        return true; // Public tasks are visible to all
      }
      if (task.email === email) {
        return true; // User's private tasks
      }
      return false;
    });

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
    const {
      email,
      date,
      title,
      time,
      visibility,
      description,
      division,
      district,
      area,
      upozila,
      union,
    } = await req.json();

    if (!email || !title || !time || !visibility || !description) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const todoData = readTodoData();

    const newTask: Task = {
      id: uuidv4(), // Assign unique ID
      email,
      date: date || new Date().toISOString().split("T")[0],
      title,
      time,
      visibility,
      description,
      division,
      district,
      area,
      upozila,
      union,
    };

    todoData.records.push(newTask);
    writeTodoData(todoData);

    // Sync with Google Calendar
    const calendarId = "primary"; // Use the primary calendar
    await createGoogleCalendarEvent(calendarId, newTask);

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
    const {
      id,
      email,
      date,
      title,
      time,
      visibility,
      description,
      division,
      district,
      area,
      upozila,
      union,
    } = await req.json();

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

    // Find and update task using ID
    todoData.records = todoData.records.map((task) => {
      if (task.id === id) {
        updated = true;
        return {
          id,
          email,
          date,
          title,
          time,
          visibility,
          description,
          division,
          district,
          area,
          upozila,
          union,
        }; // Updated task
      }
      return task;
    });

    if (!updated) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    writeTodoData(todoData);

    // Sync with Google Calendar
    const calendarId = "primary";
    await createGoogleCalendarEvent(
      calendarId,
      todoData.records.find((task) => task.id === id)!
    );

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

    // Remove task using ID
    todoData.records = todoData.records.filter((task) => task.id !== id);

    if (todoData.records.length === initialLength) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    writeTodoData(todoData);

    // Sync with Google Calendar
    const calendarId = "primary";
    await deleteGoogleCalendarEvent(calendarId, id);

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
