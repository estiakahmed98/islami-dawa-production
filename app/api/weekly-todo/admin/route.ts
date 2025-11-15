import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { AdminTodoResponse } from "@/types/weekly-todo";

const prisma = new PrismaClient();

// GET /api/weekly-todo/admin - Get all todos with user data (optimized)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get admin user
    const adminUser = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (adminUser.role !== "admin" && adminUser.role !== "centraladmin") {
      return NextResponse.json({ 
        error: "Forbidden", 
        message: `User role is '${adminUser.role}', but 'admin' or 'centraladmin' is required` 
      }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");
    const weekday = searchParams.get("weekday");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build optimized where clause
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (userId && userId !== "all") {
      where.userId = userId;
    }

    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Add weekday filtering if specified
    let weekdayFilterFn: ((todo: any) => boolean) | null = null;
    
    if (weekday && weekday !== "all") {
      // Map weekday names to day numbers (0 = Sunday, 1 = Monday, etc.)
      const weekdayMap: { [key: string]: number } = {
        'saturday': 6,
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'শনিবার': 6,
        'রবিবার': 0,
        'সোমবার': 1,
        'মঙ্গলবার': 2,
        'বুধবার': 3,
        'বৃহস্পতিবার': 4,
        'শুক্রবার': 5,
      };

      const dayOfWeek = weekdayMap[weekday.toLowerCase()];
      if (dayOfWeek !== undefined) {
        weekdayFilterFn = (todo: any) => {
          if (!todo.scheduledDate) return false;
          const scheduledDate = new Date(todo.scheduledDate);
          return scheduledDate.getDay() === dayOfWeek;
        };
      }
    }

    // Optimized query with pagination
    const [todos, totalCount] = await Promise.all([
      prisma.weeklyTodo.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              division: true,
              district: true,
              upazila: true,
              union: true,
              role: true,
              phone: true,
            },
          },
        },
        orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.weeklyTodo.count({ where }),
    ]);

    // Apply weekday filter if needed
    const filteredTodos = weekdayFilterFn ? todos.filter(weekdayFilterFn) : todos;

    const response: AdminTodoResponse = {
      todos: filteredTodos.map(todo => ({
        id: todo.id,
        title: todo.title,
        details: todo.details || undefined,
        scheduledDate: todo.scheduledDate?.toISOString(),
        status: todo.status as 'pending' | 'completed' | 'cancelled',
        completedAt: todo.completedAt?.toISOString(),
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
        userId: todo.userId,
        user: todo.user ? {
          id: todo.user.id,
          name: todo.user.name || '',
          email: todo.user.email,
          division: todo.user.division || undefined,
          district: todo.user.district || undefined,
          upazila: todo.user.upazila || undefined,
          union: todo.user.union || undefined,
          role: todo.user.role || undefined,
          phone: todo.user.phone || undefined,
        } : undefined,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin weekly todos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
