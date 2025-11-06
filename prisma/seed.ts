import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default user if it doesn't exist (for compatibility)
  const defaultUser = await prisma.user.upsert({
    where: { id: 'default-user' },
    update: {},
    create: {
      id: 'default-user',
      email: 'user@dailyflow.local',
      name: 'Default User',
    },
  });

  console.log('✅ Created default user:', defaultUser);

  // Create dev user for settings page
  const devUser = await prisma.user.upsert({
    where: { id: 'dev-user-001' },
    update: {},
    create: {
      id: 'dev-user-001',
      email: 'dev@dailyflow.local',
      name: 'Development User',
    },
  });

  console.log('✅ Created dev user:', devUser);

  // Create default task stages for the user
  const stages = [
    { key: 'todo', name: 'Todo', color: '#6B7280', icon: '📝', order: 0, isDefault: true, canDelete: false },
    { key: 'in-progress', name: 'In Progress', color: '#3B82F6', icon: '🚀', order: 1, isDefault: true, canDelete: false },
    { key: 'review', name: 'Review', color: '#F59E0B', icon: '👀', order: 2, isDefault: true, canDelete: false },
    { key: 'done', name: 'Done', color: '#10B981', icon: '✅', order: 3, isDefault: true, canDelete: false },
  ];

  for (const stage of stages) {
    await prisma.taskStage.upsert({
      where: {
        userId_key: {
          userId: defaultUser.id,
          key: stage.key
        }
      },
      update: {},
      create: {
        ...stage,
        userId: defaultUser.id,
      },
    });
  }

  console.log('✅ Created default task stages');

  // Create task stages for dev user
  for (const stage of stages) {
    await prisma.taskStage.upsert({
      where: {
        userId_key: {
          userId: devUser.id,
          key: stage.key
        }
      },
      update: {},
      create: {
        ...stage,
        userId: devUser.id,
      },
    });
  }

  console.log('✅ Created dev user task stages');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });