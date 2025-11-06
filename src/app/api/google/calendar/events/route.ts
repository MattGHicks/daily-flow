import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '@/lib/crypto';

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
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax') ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

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
    const oauth2Client = getOAuth2Client(
      settings.googleClientId || undefined,
      settings.googleClientSecret || undefined
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

    // Fetch events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    // Transform events for frontend
    const transformedEvents = events.map(event => ({
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
    }));

    return NextResponse.json({
      success: true,
      events: transformedEvents,
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