import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/weekly-todo - Get all todos for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const weekday = searchParams.get('weekday');

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const todos = await prisma.weeklyTodo.findMany({
      where,
      orderBy: [
        { scheduledDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Filter by weekday if specified
    let filteredTodos = todos;
    if (weekday && weekday !== 'all') {
      filteredTodos = todos.filter(todo => {
        if (!todo.scheduledDate) return false;
        const todoDate = new Date(todo.scheduledDate);
        const dayName = todoDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        return dayName === weekday;
      });
    }

    return NextResponse.json(filteredTodos);
  } catch (error) {
    console.error('Error fetching weekly todos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/weekly-todo - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create the todo
    const todo = await prisma.weeklyTodo.create({
      data: {
        title: body.title,
        details: body.details,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        status: body.status || 'pending',
        userId: user.id,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}