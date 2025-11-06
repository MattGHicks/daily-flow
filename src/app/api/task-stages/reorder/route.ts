import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const userId = 'default-user';
    const { stages } = await request.json();

    if (!Array.isArray(stages)) {
      return NextResponse.json(
        { success: false, error: 'Stages array is required' },
        { status: 400 }
      );
    }

    // Update order for each stage
    const updatePromises = stages.map((stage, index) =>
      prisma.taskStage.update({
        where: { id: stage.id },
        data: { order: index },
      })
    );

    await Promise.all(updatePromises);

    // Fetch updated stages
    const updatedStages = await prisma.taskStage.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: updatedStages });
  } catch (error) {
    console.error('Error reordering task stages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder task stages' },
      { status: 500 }
    );
  }
}