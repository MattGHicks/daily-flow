import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '@/lib/encryption';

const prisma = new PrismaClient();

// Initialize OAuth2 client
function getOAuth2Client(clientId?: string, clientSecret?: string, redirectUri?: string) {
  // Use localhost for Google OAuth (typically configured in Google Cloud Console)
  // while keeping 127.0.0.1 for other services
  const googleBaseUrl = process.env.GOOGLE_REDIRECT_BASE_URL || 'http://localhost:3000';
  const defaultRedirectUri = `${googleBaseUrl}/api/google/calendar/callback`;

  return new OAuth2Client(
    clientId || process.env.GOOGLE_CLIENT_ID,
    clientSecret || process.env.GOOGLE_CLIENT_SECRET,
    redirectUri || defaultRedirectUri
  );
}

// Generate authorization URL
export async function GET() {
  try {
    const userId = 'dev-user-001'; // Use same user ID as settings page

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Check if credentials are configured (trim any whitespace)
    const clientId = settings?.googleClientId?.trim() || process.env.GOOGLE_CLIENT_ID?.trim();

    // Decrypt the client secret if it comes from the database
    let clientSecret: string | undefined;
    if (settings?.googleClientSecret) {
      // The decrypt function now handles both encrypted and unencrypted data
      clientSecret = decrypt(settings.googleClientSecret)?.trim();
    } else {
      clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    }

    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Google Calendar is not configured. Please add your Client ID and Secret in Settings.'
        },
        { status: 400 }
      );
    }

    const oauth2Client = getOAuth2Client(clientId, clientSecret);

    // The redirect_uri is already set in the OAuth2Client constructor
    // Don't set it again in generateAuthUrl as it causes conflicts
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly', // Read-only access
      ],
      prompt: 'consent', // Force consent screen to get refresh token
      // Removed redirect_uri from here - it's already set in the client
    });

    // Log the generated URL for debugging
    console.log('Generated Google OAuth URL:', authUrl);
    console.log('Redirect URI:', oauth2Client.redirectUri);
    console.log('Client ID:', clientId?.substring(0, 20) + '...');

    return NextResponse.json({ success: true, authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}

// Check if user is authenticated
export async function POST() {
  try {
    const userId = 'dev-user-001'; // Use same user ID as settings page

    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings?.googleRefreshToken) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Not authenticated with Google Calendar'
      });
    }

    // Try to refresh the access token to verify authentication
    // Decrypt client secret if it exists
    const clientSecret = settings.googleClientSecret
      ? decrypt(settings.googleClientSecret)
      : undefined;

    const oauth2Client = getOAuth2Client(
      settings.googleClientId || undefined,
      clientSecret
    );

    try {
      const refreshToken = decrypt(settings.googleRefreshToken);
      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      return NextResponse.json({
        success: true,
        authenticated: true,
        message: 'Successfully authenticated with Google Calendar'
      });
    } catch (refreshError) {
      // Refresh token is invalid or expired
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Google Calendar authentication expired. Please re-authenticate.'
      });
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
}