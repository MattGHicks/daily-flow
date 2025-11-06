import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default stages for new users
const defaultStages = [
  { key: 'backlog', name: 'Backlog', color: '#64748b', icon: '📋', order: 0 },
  { key: 'todo', name: 'To Do', color: '#3b82f6', icon: '📝', order: 1 },
  { key: 'in-progress', name: 'In Progress', color: '#eab308', icon: '🚀', order: 2 },
  { key: 'review', name: 'Review', color: '#a855f7', icon: '👀', order: 3 },
  { key: 'done', name: 'Done', color: '#22c55e', icon: '✅', order: 4 },
];

export async function GET() {
  try {
    // For now, use a default userId until we implement auth
    const userId = 'default-user';

    // Check if user has custom stages
    let stages = await prisma.taskStage.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    // If no stages exist, create defaults
    if (stages.length === 0) {
      const createStages = defaultStages.map(stage => ({
        ...stage,
        userId,
        isDefault: true,
        canDelete: stage.key !== 'backlog' && stage.key !== 'done', // Backlog and Done cannot be deleted
      }));

      await prisma.taskStage.createMany({
        data: createStages,
      });

      stages = await prisma.taskStage.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
      });
    }

    return NextResponse.json({ success: true, data: stages });
  } catch (error) {
    console.error('Error fetching task stages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task stages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = 'default-user';
    const body = await request.json();

    // Get the highest order number
    const highestOrder = await prisma.taskStage.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newStage = await prisma.taskStage.create({
      data: {
        userId,
        key: body.key || body.name.toLowerCase().replace(/\s+/g, '-'),
        name: body.name,
        color: body.color || '#6b7280',
        icon: body.icon || '📌',
        order: body.order !== undefined ? body.order : (highestOrder?.order || 0) + 1,
        isDefault: false,
        canDelete: true,
      },
    });

    return NextResponse.json({ success: true, data: newStage });
  } catch (error) {
    console.error('Error creating task stage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task stage' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = 'default-user';
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    // Check if the stage belongs to the user
    const stage = await prisma.taskStage.findFirst({
      where: { id, userId },
    });

    if (!stage) {
      return NextResponse.json(
        { success: false, error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Update the stage
    const updatedStage = await prisma.taskStage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedStage });
  } catch (error) {
    console.error('Error updating task stage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task stage' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = 'default-user';
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    // Check if the stage exists and can be deleted
    const stage = await prisma.taskStage.findFirst({
      where: { id, userId },
    });

    if (!stage) {
      return NextResponse.json(
        { success: false, error: 'Stage not found' },
        { status: 404 }
      );
    }

    if (!stage.canDelete) {
      return NextResponse.json(
        { success: false, error: 'This stage cannot be deleted' },
        { status: 403 }
      );
    }

    // Check if there are tasks in this stage
    const tasksInStage = await prisma.task.count({
      where: { stageId: id },
    });

    if (tasksInStage > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete stage with tasks. Move or delete tasks first.' },
        { status: 400 }
      );
    }

    // Delete the stage
    await prisma.taskStage.delete({
      where: { id },
    });

    // Reorder remaining stages
    const remainingStages = await prisma.taskStage.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    // Update orders to be sequential
    for (let i = 0; i < remainingStages.length; i++) {
      await prisma.taskStage.update({
        where: { id: remainingStages[i].id },
        data: { order: i },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task stage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task stage' },
      { status: 500 }
    );
  }
}