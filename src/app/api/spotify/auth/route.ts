import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { decryptFields } from '@/lib/encryption';

const prisma = new PrismaClient();
const USER_ID = 'dev-user-001'; // Use same user ID as settings page

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-read-recently-played',
  'user-top-read',
].join(' ');

export async function GET(request: NextRequest) {
  try {
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

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'}/api/spotify/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Spotify credentials not configured. Please add them in Settings or in your .env file.'
      }, { status: 400 });
    }

    // Generate a random state for security
    const state = Math.random().toString(36).substring(7);

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: SPOTIFY_SCOPES,
      redirect_uri: redirectUri,
      state: state,
      show_dialog: 'true', // Always show authorization dialog
    });

    const authUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`;

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('Error generating Spotify auth URL:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate authorization URL'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated with Spotify
    const settings = await prisma.userSettings.findUnique({
      where: { userId: USER_ID },
    });

    const isAuthenticated = !!settings?.spotifyRefreshToken;

    return NextResponse.json({
      success: true,
      authenticated: isAuthenticated,
    });
  } catch (error) {
    console.error('Error checking Spotify auth:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Failed to check authentication status'
    }, { status: 500 });
  }
}