import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import {
  fetchRedmineIssues,
  getCurrentRedmineUser,
  mapRedminePriority,
  formatRelativeTime,
  getLastMessage,
  getLastMessageAuthor,
  wasLastMessageByUser,
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

    // Get current user info to check who sent messages
    const currentUser = await getCurrentRedmineUser(settings.redmineUrl, apiKey);
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get current user from Redmine',
        },
        { status: 500 }
      );
    }

    // Fetch issues from Redmine (list endpoint - doesn't include journals)
    const { issues, totalCount } = await fetchRedmineIssues(
      settings.redmineUrl,
      apiKey,
      {
        assignedToId: 'me', // Fetch issues assigned to the authenticated user
        statusId: 'open', // Only fetch open issues
        limit: 25, // Limit to recent 25 issues (we'll fetch details for these)
        sort: 'updated_on:desc', // Most recently updated first
      }
    );

    // Fetch full details (with journals) for each issue
    // Note: This makes individual API calls but is necessary to get journal data
    const { fetchRedmineIssue } = await import('@/lib/api/redmine');

    const detailedIssuesPromises = issues.map((issue) =>
      fetchRedmineIssue(settings.redmineUrl!, apiKey, issue.id)
    );

    const detailedIssues = await Promise.all(detailedIssuesPromises);

    // Transform Redmine issues into MessageThread format
    const messageThreads: MessageThread[] = detailedIssues
      .filter((issue): issue is NonNullable<typeof issue> => issue !== null)
      .map((detailedIssue) => {
        const lastMessageAuthor = getLastMessageAuthor(detailedIssue);
        const lastMessageSentByMe = wasLastMessageByUser(detailedIssue, currentUser.id);

        // Issue needs response if:
        // 1. It's open/unread
        // 2. Last message was NOT sent by me
        // 3. It's assigned to me or I'm involved
        const needsResponse = isIssueUnread(detailedIssue) && !lastMessageSentByMe;

        return {
          id: detailedIssue.id.toString(),
          client: detailedIssue.project.name,
          subject: detailedIssue.subject,
          lastMessage: getLastMessage(detailedIssue),
          timestamp: formatRelativeTime(detailedIssue.updated_on),
          unread: isIssueUnread(detailedIssue),
          priority: mapRedminePriority(detailedIssue.priority.name),
          // Message tracking
          lastMessageSentByMe,
          lastMessageAuthor: lastMessageAuthor?.name || 'Unknown',
          needsResponse,
          // Additional Redmine-specific data
          redmineIssueId: detailedIssue.id,
          redmineProjectId: detailedIssue.project.id,
          redmineStatus: detailedIssue.status.name,
          redmineTracker: detailedIssue.tracker.name,
          redmineUrl: `${settings.redmineUrl}/issues/${detailedIssue.id}`,
          assignedTo: detailedIssue.assigned_to?.name,
          author: detailedIssue.author.name,
          createdOn: detailedIssue.created_on,
          updatedOn: detailedIssue.updated_on,
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
