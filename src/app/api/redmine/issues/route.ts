import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import {
  fetchRedmineIssues,
  mapRedminePriority,
  formatRelativeTime,
  getLastMessage,
  isIssueUnread,
  type RedmineIssueDetailed,
} from '@/lib/api/redmine';
import { MessageThread } from '@/types/message';

// Temporary user ID for development (will be replaced with actual auth)
const DEV_USER_ID = 'dev-user-001';

// Cache configuration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cachedData: MessageThread[] | null = null;
let cacheTimestamp: number = 0;

/**
 * GET /api/redmine/issues
 * Fetches issues from Redmine and transforms them into message threads
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

    // Get user settings to retrieve Redmine credentials
    const settings = await prisma.userSettings.findUnique({
      where: { userId: DEV_USER_ID },
    });

    if (!settings?.redmineUrl || !settings?.redmineApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Redmine URL and API key not configured. Please add them in Settings.',
          needsConfiguration: true,
        },
        { status: 400 }
      );
    }

    // Decrypt the API key
    const apiKey = decrypt(settings.redmineApiKey);
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to decrypt Redmine API key',
        },
        { status: 500 }
      );
    }

    // Fetch issues from Redmine
    // We'll fetch recent issues assigned to the current user or created by them
    const { issues, totalCount } = await fetchRedmineIssues(
      settings.redmineUrl,
      apiKey,
      {
        assignedToId: 'me', // Fetch issues assigned to the authenticated user
        statusId: 'open', // Only fetch open issues
        limit: 50, // Limit to recent 50 issues
        sort: 'updated_on:desc', // Most recently updated first
        include: 'journals', // Include comments/journals
      }
    );

    // Transform Redmine issues into MessageThread format
    const messageThreads: MessageThread[] = issues.map((issue) => {
      const detailedIssue = issue as RedmineIssueDetailed;

      return {
        id: issue.id.toString(),
        client: issue.project.name,
        subject: issue.subject,
        lastMessage: getLastMessage(detailedIssue),
        timestamp: formatRelativeTime(issue.updated_on),
        unread: isIssueUnread(issue),
        priority: mapRedminePriority(issue.priority.name),
        // Additional Redmine-specific data
        redmineIssueId: issue.id,
        redmineProjectId: issue.project.id,
        redmineStatus: issue.status.name,
        redmineTracker: issue.tracker.name,
        redmineUrl: `${settings.redmineUrl}/issues/${issue.id}`,
        assignedTo: issue.assigned_to?.name,
        author: issue.author.name,
        createdOn: issue.created_on,
        updatedOn: issue.updated_on,
      };
    });

    // Update cache
    cachedData = messageThreads;
    cacheTimestamp = now;

    return NextResponse.json({
      success: true,
      data: messageThreads,
      cached: false,
      totalCount,
      redmineUrl: settings.redmineUrl,
    });
  } catch (error) {
    console.error('Error fetching Redmine issues:', error);

    // Clear cache on error
    cachedData = null;
    cacheTimestamp = 0;

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch issues from Redmine',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/redmine/issues/refresh
 * Forces a refresh of the Redmine issues cache
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
        error: 'Failed to refresh Redmine issues',
      },
      { status: 500 }
    );
  }
}
