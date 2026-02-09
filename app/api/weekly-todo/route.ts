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
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 200);

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

    const orderBy: Array<{ scheduledDate: 'asc' | 'desc' } | { createdAt: 'asc' | 'desc' }> = [
      { scheduledDate: 'asc' as const },
      { createdAt: 'desc' as const },
    ];

    if (weekday && weekday !== 'all') {
      const todos = await prisma.weeklyTodo.findMany({
        where,
        orderBy,
      });

      const weekdayMap: { [key: string]: number } = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
      };

      const filteredTodos = todos.filter(todo => {
        if (!todo.scheduledDate) return false;
        const todoDate = new Date(todo.scheduledDate);
        const dayOfWeek = todoDate.getDay();
        return weekdayMap[weekday.toLowerCase()] === dayOfWeek;
      });

      const total = filteredTodos.length;
      const startIndex = (page - 1) * limit;
      const items = filteredTodos.slice(startIndex, startIndex + limit);

      const stats = filteredTodos.reduce(
        (acc, todo) => {
          acc.total += 1;
          if (todo.status === 'completed') acc.completed += 1;
          if (todo.status === 'pending') acc.pending += 1;
          if (todo.status === 'cancelled') acc.cancelled += 1;
          return acc;
        },
        { total: 0, completed: 0, pending: 0, cancelled: 0 }
      );

      return NextResponse.json({
        items,
        total,
        page,
        limit,
        stats,
      });
    }

    const [items, total, statusCounts] = await Promise.all([
      prisma.weeklyTodo.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.weeklyTodo.count({ where }),
      prisma.weeklyTodo.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    const stats = statusCounts.reduce(
      (acc, row) => {
        if (row.status === 'completed') acc.completed = row._count.status;
        if (row.status === 'pending') acc.pending = row._count.status;
        if (row.status === 'cancelled') acc.cancelled = row._count.status;
        return acc;
      },
      { total, completed: 0, pending: 0, cancelled: 0 }
    );

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      stats,
    });
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
