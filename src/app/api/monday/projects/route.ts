import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { fetchMondayProjects, getItemStatus } from '@/lib/api/monday';

// Temporary user ID for development (will be replaced with actual auth)
const DEV_USER_ID = 'dev-user-001';

// Configuration for boards to fetch
const BOARD_NAMES = ['Revize Projects 2.0', 'Revize Projects', 'QA Board'];

// Groups to exclude per board
const EXCLUDED_GROUPS = {
  'QA Board': ['Completed QA\'s'], // Hide "Completed QA's" group from QA Board
};

// Background sync interval (5 minutes)
const SYNC_INTERVAL = 5 * 60 * 1000;
let lastSyncTime = 0;

/**
 * Sync projects from Monday.com to database
 */
async function syncProjectsToDatabase(apiKey: string) {
  try {
    // Get current user for account slug
    const { getCurrentUser } = await import('@/lib/api/monday');
    const currentUser = await getCurrentUser(apiKey);
    // Use 'revize' as the account slug for Revize Monday workspace
    const accountSlug = 'revize';

    // Fetch all projects from Monday.com
    const mondayResults = await fetchMondayProjects(apiKey, BOARD_NAMES, {
      excludeGroups: EXCLUDED_GROUPS,
    });

    // Get all Monday IDs from the API response
    const apiProjectIds = new Set<string>();
    const projectsToUpsert = [];

    // Transform Monday.com items for database
    for (const { board, items } of mondayResults) {
      for (const item of items) {
        apiProjectIds.add(item.id);

        const statusInfo = getItemStatus(item, board.columns || []);
        // Include the view ID in the URL - default view ID for Revize boards
        const viewId = '195126247'; // You can make this configurable per board if needed
        const mondayUrl = `https://${accountSlug}.monday.com/boards/${board.id}/views/${viewId}/pulses/${item.id}`;

        projectsToUpsert.push({
          mondayId: item.id,
          userId: DEV_USER_ID,
          name: item.name,
          status: statusInfo.label,
          assignee: null, // Could extract from column values if needed
          board: board.name,
          boardId: BigInt(board.id), // Convert to BigInt for large IDs
          groupId: item.group.id,
          groupName: item.group.title,
          color: statusInfo.color,
          columnValues: item.column_values || null,
          lastSyncedAt: new Date(),
        });
      }
    }

    // Perform database operations in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete projects that no longer exist in Monday.com
      const deletedCount = await tx.project.deleteMany({
        where: {
          userId: DEV_USER_ID,
          mondayId: {
            notIn: Array.from(apiProjectIds),
          },
        },
      });

      if (deletedCount.count > 0) {
        console.log(`Removed ${deletedCount.count} projects no longer in Monday.com`);
      }

      // Upsert all projects from the API
      for (const project of projectsToUpsert) {
        await tx.project.upsert({
          where: {
            mondayId: project.mondayId,
          },
          create: project,
          update: {
            name: project.name,
            status: project.status,
            assignee: project.assignee,
            board: project.board,
            boardId: project.boardId, // Already converted to int above
            groupId: project.groupId,
            groupName: project.groupName,
            color: project.color,
            columnValues: project.columnValues,
            lastSyncedAt: project.lastSyncedAt,
          },
        });
      }
    });

    console.log(`Synced ${projectsToUpsert.length} projects to database`);
    return true;
  } catch (error) {
    console.error('Error syncing projects to database:', error);
    return false;
  }
}

/**
 * GET /api/monday/projects
 * Returns cached projects from database, triggers background sync if needed
 */
export async function GET() {
  try {
    // Always fetch projects from database first (instant response)
    const cachedProjects = await prisma.project.findMany({
      where: { userId: DEV_USER_ID },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform database projects to API response format
    const projects = cachedProjects.map((project) => {
      // Use 'revize' as the account slug for Revize Monday workspace
      const accountSlug = 'revize';
      const viewId = '195126247'; // Default view ID for Revize boards

      const mondayUrl = `https://${accountSlug}.monday.com/boards/${project.boardId}/views/${viewId}/pulses/${project.mondayId}`;

      return {
        id: project.mondayId,
        name: project.name,
        title: project.name, // Alias for compatibility
        status: project.status,
        lastUpdated: project.updatedAt.toISOString(),
        // Monday-specific fields
        board: project.board,
        boardName: project.board, // Alias for compatibility
        groupName: project.groupName,
        mondayItemId: project.mondayId,
        mondayBoardId: project.boardId.toString(), // Convert BigInt to string for JSON
        mondayUrl: mondayUrl,
        mondayStatus: project.status,
        mondayStatusColor: project.color,
        // Cache info
        lastSyncedAt: project.lastSyncedAt.toISOString(),
      };
    });

    // Check if we need to trigger a background sync
    const now = Date.now();
    const shouldSync = now - lastSyncTime > SYNC_INTERVAL;

    // Get user settings to check if Monday.com is configured
    const settings = await prisma.userSettings.findUnique({
      where: { userId: DEV_USER_ID },
    });

    if (settings?.mondayApiKey && shouldSync) {
      lastSyncTime = now;

      // Decrypt the API key
      const apiKey = decrypt(settings.mondayApiKey);
      if (apiKey) {
        // Trigger background sync (don't await - let it run async)
        syncProjectsToDatabase(apiKey).then((success) => {
          if (success) {
            console.log('Background sync completed successfully');
          } else {
            console.log('Background sync failed, will retry on next request');
            // Reset sync time to retry sooner
            lastSyncTime = now - (SYNC_INTERVAL - 60000); // Retry in 1 minute
          }
        });
      }
    }

    // Calculate cache age
    const oldestProject = cachedProjects.length > 0
      ? Math.min(...cachedProjects.map(p => p.lastSyncedAt.getTime()))
      : now;
    const cacheAge = Math.floor((now - oldestProject) / 1000);

    // Group projects by board for summary
    const boardSummary = projects.reduce((acc, project) => {
      const board = project.board;
      if (!acc[board]) {
        acc[board] = { name: board, count: 0 };
      }
      acc[board].count++;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);

    return NextResponse.json({
      success: true,
      data: projects,
      cached: true,
      fromDatabase: true,
      cacheAge, // seconds
      totalProjects: projects.length,
      boards: Object.values(boardSummary),
      syncInProgress: shouldSync && settings?.mondayApiKey ? true : false,
      lastSyncedAt: cachedProjects.length > 0
        ? cachedProjects[0].lastSyncedAt.toISOString()
        : null,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch projects',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monday/projects/refresh
 * Forces a refresh from Monday.com API
 */
export async function POST() {
  try {
    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId: DEV_USER_ID },
    });

    if (!settings?.mondayApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Monday.com API key not configured. Please add it in Settings.',
        },
        { status: 400 }
      );
    }

    // Decrypt the API key
    const apiKey = decrypt(settings.mondayApiKey);
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to decrypt Monday.com API key',
        },
        { status: 500 }
      );
    }

    // Perform sync synchronously for manual refresh
    const syncSuccess = await syncProjectsToDatabase(apiKey);

    if (!syncSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to sync projects from Monday.com',
        },
        { status: 500 }
      );
    }

    // Reset sync timer
    lastSyncTime = Date.now();

    // Return the updated projects
    return await GET();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh Monday.com projects',
      },
      { status: 500 }
    );
  }
}