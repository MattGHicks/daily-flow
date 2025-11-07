import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Temporary user ID for development (will be replaced with actual auth)
const DEV_USER_ID = 'dev-user-001';

/**
 * GET /api/tasks/archived
 * Fetch all archived tasks for the current user
 */
export async function GET() {
  try {
    const archivedTasks = await prisma.task.findMany({
      where: {
        userId: DEV_USER_ID,
        archived: true,
      },
      orderBy: [
        { archivedAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: archivedTasks,
    });
  } catch (error) {
    console.error('Error fetching archived tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch archived tasks',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/archived
 * Unarchive a task
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task ID is required',
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: {
        id: taskId,
        userId: DEV_USER_ID,
      },
      data: {
        archived: false,
        archivedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error unarchiving task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unarchive task',
      },
      { status: 500 }
    );
  }
}
