import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Temporary user ID for development (will be replaced with actual auth)
const DEV_USER_ID = 'dev-user-001';

/**
 * GET /api/stages
 * Fetch all task stages for the current user
 */
export async function GET() {
  try {
    const stages = await prisma.taskStage.findMany({
      where: { userId: DEV_USER_ID },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stages',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stages
 * Create a new task stage
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, color } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title is required',
        },
        { status: 400 }
      );
    }

    // Get the highest order number
    const maxOrderStage = await prisma.taskStage.findFirst({
      where: { userId: DEV_USER_ID },
      orderBy: { order: 'desc' },
    });

    const order = (maxOrderStage?.order ?? -1) + 1;

    const stage = await prisma.taskStage.create({
      data: {
        userId: DEV_USER_ID,
        title: title.trim(),
        order,
        color,
      },
    });

    return NextResponse.json({
      success: true,
      data: stage,
    });
  } catch (error) {
    console.error('Error creating stage:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create stage',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stages
 * Update stage(s) - can be single or multiple for reordering
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

    // Update all stages in a transaction
    const updatePromises = updates.map((update) => {
      const { id, ...data } = update;

      return prisma.taskStage.update({
        where: {
          id,
          userId: DEV_USER_ID, // Ensure user owns the stage
        },
        data,
      });
    });

    const updatedStages = await prisma.$transaction(updatePromises);

    return NextResponse.json({
      success: true,
      data: updatedStages,
    });
  } catch (error) {
    console.error('Error updating stages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update stages',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stages
 * Delete a stage (and optionally move tasks to another stage)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const moveTasksTo = searchParams.get('moveTasksTo');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stage ID is required',
        },
        { status: 400 }
      );
    }

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // If moveTasksTo is provided, move all tasks to that stage
      if (moveTasksTo) {
        await tx.task.updateMany({
          where: {
            status: id,
            userId: DEV_USER_ID,
          },
          data: {
            status: moveTasksTo,
          },
        });
      } else {
        // Otherwise, delete all tasks in this stage
        await tx.task.deleteMany({
          where: {
            status: id,
            userId: DEV_USER_ID,
          },
        });
      }

      // Delete the stage
      await tx.taskStage.delete({
        where: {
          id,
          userId: DEV_USER_ID,
        },
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete stage',
      },
      { status: 500 }
    );
  }
}
