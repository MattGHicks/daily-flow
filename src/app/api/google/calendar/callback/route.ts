import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/encryption';

const prisma = new PrismaClient();

function getOAuth2Client(clientId?: string, clientSecret?: string) {
  // Use localhost for Google OAuth (typically configured in Google Cloud Console)
  const googleBaseUrl = process.env.GOOGLE_REDIRECT_BASE_URL || 'http://localhost:3000';
  return new OAuth2Client(
    clientId || process.env.GOOGLE_CLIENT_ID,
    clientSecret || process.env.GOOGLE_CLIENT_SECRET,
    `${googleBaseUrl}/api/google/calendar/callback`
  );
}

export async function GET(request: NextRequest) {
  // Always use NEXT_PUBLIC_APP_URL for redirects back to the app
  // This ensures users are redirected to the URL they normally use (127.0.0.1)
  const userBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // User denied access
      return NextResponse.redirect(
        `${userBaseUrl}/dashboard/calendar?error=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${userBaseUrl}/dashboard/calendar?error=no_code`
      );
    }

    const userId = 'dev-user-001'; // Use same user ID as settings page

    // Get user settings for custom client credentials
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Get and decrypt credentials (Client Secret is stored encrypted)
    const clientId = settings?.googleClientId?.trim() || process.env.GOOGLE_CLIENT_ID?.trim();

    // Decrypt the client secret if it comes from the database
    let clientSecret: string | undefined;
    if (settings?.googleClientSecret) {
      // The decrypt function now handles both encrypted and unencrypted data
      clientSecret = decrypt(settings.googleClientSecret)?.trim();
    } else {
      clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    }

    console.log('Callback - Using Client ID:', clientId?.substring(0, 20) + '...');
    console.log('Callback - Client Secret present:', !!clientSecret);
    console.log('Callback - Client Secret length:', clientSecret?.length);

    if (!clientId || !clientSecret) {
      console.error('Missing credentials in callback');
      return NextResponse.redirect(
        `${userBaseUrl}/dashboard/calendar?error=missing_credentials`
      );
    }

    const oauth2Client = getOAuth2Client(clientId, clientSecret);

    // Exchange code for tokens
    console.log('Attempting to exchange code for tokens...');
    console.log('Code:', code?.substring(0, 20) + '...');

    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', tokens ? 'Yes' : 'No');
    console.log('Refresh token:', tokens.refresh_token ? 'Present' : 'Missing');

    // Encrypt and store the refresh token
    if (tokens.refresh_token) {
      const encryptedRefreshToken = encrypt(tokens.refresh_token);

      await prisma.userSettings.upsert({
        where: { userId },
        update: {
          googleRefreshToken: encryptedRefreshToken,
        },
        create: {
          userId,
          googleRefreshToken: encryptedRefreshToken,
        },
      });
      console.log('Refresh token saved successfully');
    } else {
      console.warn('No refresh token received - user may need to re-authorize');
    }

    // Redirect back to calendar page with success
    return NextResponse.redirect(
      `${userBaseUrl}/dashboard/calendar?success=true`
    );
  } catch (error: any) {
    console.error('Error in Google Calendar callback:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);

    // Check for specific error types
    if (error.message?.includes('invalid_client')) {
      console.error('Invalid client credentials - check Client ID and Secret');
    } else if (error.message?.includes('invalid_grant')) {
      console.error('Invalid authorization code - may have expired or been used already');
    }

    return NextResponse.redirect(
      `${userBaseUrl}/dashboard/calendar?error=callback_failed`
    );
  }
}