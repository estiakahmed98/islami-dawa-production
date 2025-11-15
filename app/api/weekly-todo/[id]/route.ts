import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/weekly-todo/[id] - Get a specific todo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const todo = await prisma.weeklyTodo.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Ensure user can only access their own todos
      },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching weekly todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/weekly-todo/[id] - Update a todo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check if todo exists and belongs to user
    const existingTodo = await prisma.weeklyTodo.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      title: body.title,
      details: body.details,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      status: body.status,
    };

    // If status is being updated to completed and it wasn't completed before
    if (body.status === 'completed' && existingTodo.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    // If status is being changed from completed to something else
    if (body.status !== 'completed' && existingTodo.status === 'completed') {
      updateData.completedAt = null;
    }

    const updatedTodo = await prisma.weeklyTodo.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating weekly todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/weekly-todo/[id] - Delete a todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.weeklyTodo.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await prisma.weeklyTodo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting weekly todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/weekly-todo/[id] - Partial update (useful for marking as complete)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check if todo exists and belongs to user
    const existingTodo = await prisma.weeklyTodo.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // Prepare update data for partial update
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.scheduledDate !== undefined) {
      updateData.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
      
      // Handle completedAt timestamp
      if (body.status === 'completed' && existingTodo.status !== 'completed') {
        updateData.completedAt = new Date();
      } else if (body.status !== 'completed' && existingTodo.status === 'completed') {
        updateData.completedAt = null;
      }
    }

    const updatedTodo = await prisma.weeklyTodo.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating weekly todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}