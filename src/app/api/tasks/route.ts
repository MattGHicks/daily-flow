import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Temporary user ID for development (will be replaced with actual auth)
const DEV_USER_ID = 'dev-user-001';

/**
 * GET /api/tasks
 * Fetch all tasks for the current user
 */
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: DEV_USER_ID },
      orderBy: [
        { status: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tasks',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      priority,
      status,
      assignee,
      dueDate,
      tags,
      project,
      linkedProjectId,
      linkedMessageThreadId,
    } = body;

    // Get the highest order number in the status column
    const maxOrderTask = await prisma.task.findFirst({
      where: {
        userId: DEV_USER_ID,
        status,
      },
      orderBy: { order: 'desc' },
    });

    const order = (maxOrderTask?.order ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        userId: DEV_USER_ID,
        title,
        description,
        priority,
        status: status || 'backlog',
        order,
        assignee,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        project,
        linkedProjectId,
        linkedMessageThreadId,
      },
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create task',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks
 * Update multiple tasks (for reordering, linking, etc.)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { id, ...fields }

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Updates must be an array',
        },
        { status: 400 }
      );
    }

    // Update all tasks in a transaction
    const updatePromises = updates.map((update) => {
      const { id, ...data } = update;

      // Convert dueDate if it exists
      if (data.dueDate) {
        data.dueDate = new Date(data.dueDate);
      }

      return prisma.task.update({
        where: {
          id,
          userId: DEV_USER_ID, // Ensure user owns the task
        },
        data,
      });
    });

    const updatedTasks = await prisma.$transaction(updatePromises);

    return NextResponse.json({
      success: true,
      data: updatedTasks,
    });
  } catch (error) {
    console.error('Error updating tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tasks',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks
 * Delete a task
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.task.delete({
      where: {
        id,
        userId: DEV_USER_ID, // Ensure user owns the task
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete task',
      },
      { status: 500 }
    );
  }
}
