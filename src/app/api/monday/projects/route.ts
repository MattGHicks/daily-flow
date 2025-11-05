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

// Cache configuration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cachedData: any = null;
let cacheTimestamp: number = 0;

/**
 * GET /api/monday/projects
 * Fetches projects from Monday.com boards
 */
export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000), // seconds
      });
    }

    // Get user settings to retrieve Monday.com API key
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

    // Get current user to get account slug for URLs
    const { getCurrentUser } = await import('@/lib/api/monday');
    const currentUser = await getCurrentUser(apiKey);
    const accountSlug = currentUser?.account?.slug || 'monday';

    // Fetch projects from Monday.com
    const mondayResults = await fetchMondayProjects(apiKey, BOARD_NAMES, {
      excludeGroups: EXCLUDED_GROUPS,
    });

    // Transform Monday.com items to our Project type
    const projects = mondayResults.flatMap(({ board, items }) =>
      items.map((item) => {
        const statusInfo = getItemStatus(item, board.columns || []);
        // Construct Monday.com URL with account slug
        const mondayUrl = `https://${accountSlug}.monday.com/boards/${board.id}/pulses/${item.id}`;

        return {
          id: item.id,
          title: item.name,
          status: statusInfo.label, // Use original Monday.com status label
          lastUpdated: new Date(item.updated_at).toISOString(),
          // Monday-specific fields
          boardName: board.name,
          groupName: item.group.title,
          mondayItemId: item.id,
          mondayBoardId: board.id,
          mondayUrl: mondayUrl,
          mondayStatus: statusInfo.label,
          mondayStatusColor: statusInfo.color,
        };
      })
    );

    // Update cache
    cachedData = projects;
    cacheTimestamp = now;

    return NextResponse.json({
      success: true,
      data: projects,
      cached: false,
      totalProjects: projects.length,
      boards: mondayResults.map(({ board, items }) => ({
        name: board.name,
        count: items.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching Monday.com projects:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch projects from Monday.com',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monday/projects/refresh
 * Forces a refresh of the Monday.com projects cache
 */
export async function POST() {
  try {
    // Clear cache
    cachedData = null;
    cacheTimestamp = 0;

    // Call GET to fetch fresh data
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
