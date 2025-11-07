import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encrypt, decryptFields } from '@/lib/encryption';

const prisma = new PrismaClient();
const USER_ID = 'dev-user-001'; // Use same user ID as settings page

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string) {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'}/api/spotify/callback`;

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle user denial
    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/music?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/music?error=no_code', request.url)
      );
    }

    // Get user settings from database
    const settings = await prisma.userSettings.findUnique({
      where: { userId: USER_ID },
    });

    // Get credentials from database or fall back to environment variables
    let clientId = settings?.spotifyClientId || process.env.SPOTIFY_CLIENT_ID;
    let clientSecret = settings?.spotifyClientSecret || process.env.SPOTIFY_CLIENT_SECRET;

    // Decrypt if from database
    if (settings?.spotifyClientSecret) {
      const decrypted = decryptFields(settings, ['spotifyClientSecret'] as any);
      clientSecret = decrypted.spotifyClientSecret;
    }

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/dashboard/music?error=no_credentials', request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokenData = await exchangeCodeForToken(code, clientId, clientSecret);

    // Encrypt the refresh token
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);

    // Store tokens in database
    await prisma.userSettings.upsert({
      where: { userId: USER_ID },
      update: {
        spotifyRefreshToken: encryptedRefreshToken,
      },
      create: {
        userId: USER_ID,
        spotifyRefreshToken: encryptedRefreshToken,
        spotifyClientId: clientId,
        spotifyClientSecret: clientSecret,
      },
    });

    // Redirect to music page with success
    return NextResponse.redirect(
      new URL('/dashboard/music?success=true', request.url)
    );
  } catch (error) {
    console.error('Error in Spotify callback:', error);

    // Redirect with error
    return NextResponse.redirect(
      new URL(`/dashboard/music?error=callback_failed`, request.url)
    );
  }
}