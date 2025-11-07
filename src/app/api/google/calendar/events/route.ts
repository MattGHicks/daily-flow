import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '@/lib/encryption';

const prisma = new PrismaClient();

function getOAuth2Client(clientId?: string, clientSecret?: string) {
  return new OAuth2Client(
    clientId || process.env.GOOGLE_CLIENT_ID,
    clientSecret || process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/google/calendar/callback`
  );
}

export async function GET(request: NextRequest) {
  try {
    const userId = 'dev-user-001'; // Use same user ID as settings page
    const searchParams = request.nextUrl.searchParams;

    // Parse date range from query params
    // Include past 30 days and future 90 days
    const timeMin = searchParams.get('timeMin') ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
    const timeMax = searchParams.get('timeMax') ||
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days from now

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings?.googleRefreshToken) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Not authenticated with Google Calendar'
      });
    }

    // Set up OAuth2 client
    // Decrypt client secret if it exists
    const clientSecret = settings.googleClientSecret
      ? decrypt(settings.googleClientSecret)
      : undefined;

    const oauth2Client = getOAuth2Client(
      settings.googleClientId || undefined,
      clientSecret
    );

    const refreshToken = decrypt(settings.googleRefreshToken);
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // Refresh access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // Initialize calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // First, get all calendars
    const calendarList = await calendar.calendarList.list();
    const calendars = calendarList.data.items || [];

    console.log(`Found ${calendars.length} calendars`);

    // Fetch events from all calendars
    const allEvents = [];
    for (const cal of calendars) {
      if (!cal.id) continue; // Skip calendars without an ID

      try {
        const response = await calendar.events.list({
          calendarId: cal.id,
          timeMin,
          timeMax,
          maxResults: 100,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const calEvents = response.data.items || [];
        console.log(`Fetched ${calEvents.length} events from calendar: ${cal.summary}`);
        allEvents.push(...calEvents);
      } catch (error) {
        console.error(`Error fetching events from calendar ${cal.summary}:`, error);
      }
    }

    // Sort all events by start time
    const events = allEvents.sort((a, b) => {
      const aStart = a.start?.dateTime || a.start?.date || '';
      const bStart = b.start?.dateTime || b.start?.date || '';
      return aStart.localeCompare(bStart);
    });

    console.log(`Total fetched ${events.length} events from all calendars`);

    // Create a map of calendar IDs to calendar info
    const calendarMap = new Map(
      calendars.map(cal => [
        cal.id || '',
        {
          id: cal.id,
          summary: cal.summary,
          backgroundColor: cal.backgroundColor,
          foregroundColor: cal.foregroundColor,
        }
      ])
    );

    // Transform events for frontend with calendar info
    const transformedEvents = events.map(event => {
      const calendarInfo = calendarMap.get(event.organizer?.email || '');

      return {
        id: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        allDay: !event.start?.dateTime,
        location: event.location,
        status: event.status,
        htmlLink: event.htmlLink,
        colorId: event.colorId,
        attendees: event.attendees?.map(a => ({
          email: a.email,
          displayName: a.displayName,
          responseStatus: a.responseStatus,
          organizer: a.organizer,
        })),
        organizer: event.organizer,
        conferenceData: event.conferenceData,
        recurrence: event.recurrence,
        calendarId: event.organizer?.email,
        calendarName: calendarInfo?.summary || 'Unknown Calendar',
      };
    });

    // Transform calendar list for frontend
    const transformedCalendars = calendars.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor,
      primary: cal.primary,
    }));

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      calendars: transformedCalendars,
      authenticated: true,
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Google Calendar authentication expired. Please re-authenticate.'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST method removed - read-only access only