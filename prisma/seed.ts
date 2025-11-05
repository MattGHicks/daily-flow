import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Temporary user ID for development
const DEV_USER_ID = 'dev-user-001';

async function main() {
  console.log('🌱 Seeding database...');

  // Create a default user if it doesn't exist
  const user = await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    update: {},
    create: {
      id: DEV_USER_ID,
      email: 'dev@daily-flow.local',
      name: 'Dev User',
    },
  });

  console.log('✅ User created:', user.email);

  // Check if stages already exist
  const existingStages = await prisma.taskStage.count({
    where: { userId: DEV_USER_ID },
  });

  if (existingStages > 0) {
    console.log('ℹ️  Stages already exist, skipping stage creation...');
    return;
  }

  // Create default stages
  const defaultStages = [
    { title: 'Backlog', order: 0 },
    { title: 'To Do', order: 1 },
    { title: 'In Progress', order: 2 },
    { title: 'Review', order: 3 },
    { title: 'Done', order: 4 },
  ];

  for (const stage of defaultStages) {
    const created = await prisma.taskStage.create({
      data: {
        userId: DEV_USER_ID,
        title: stage.title,
        order: stage.order,
      },
    });
    console.log(`✅ Stage created: ${created.title}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
