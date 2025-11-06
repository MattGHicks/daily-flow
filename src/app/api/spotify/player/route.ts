import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '@/lib/crypto';
import { decryptFields } from '@/lib/encryption';

const prisma = new PrismaClient();
const USER_ID = 'dev-user-001'; // Use same user ID as settings page
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

async function getAccessToken(refreshToken: string, clientId: string, clientSecret: string) {
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
}

// GET current playback state
export async function GET(request: NextRequest) {
  try {
    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId: USER_ID },
    });

    if (!settings?.spotifyRefreshToken) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Not authenticated with Spotify'
      });
    }

    // Get credentials from database or environment
    let clientId = settings.spotifyClientId || process.env.SPOTIFY_CLIENT_ID!;
    let clientSecret = settings.spotifyClientSecret || process.env.SPOTIFY_CLIENT_SECRET!;

    // Decrypt secrets
    if (settings.spotifyClientSecret) {
      const decrypted = decryptFields(settings, ['spotifyClientSecret'] as any);
      clientSecret = decrypted.spotifyClientSecret;
    }

    // Get access token
    const refreshToken = decrypt(settings.spotifyRefreshToken);
    const accessToken = await getAccessToken(
      refreshToken,
      clientId,
      clientSecret
    );

    // Get current playback
    const playbackResponse = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (playbackResponse.status === 204) {
      // No active device
      return NextResponse.json({
        success: true,
        playback: null,
        message: 'No active playback'
      });
    }

    if (!playbackResponse.ok) {
      throw new Error('Failed to get playback state');
    }

    const playbackData = await playbackResponse.json();

    // Format response
    const response = {
      success: true,
      playback: {
        isPlaying: playbackData.is_playing,
        track: playbackData.item ? {
          id: playbackData.item.id,
          name: playbackData.item.name,
          artists: playbackData.item.artists.map((a: any) => a.name),
          album: {
            name: playbackData.item.album.name,
            image: playbackData.item.album.images[0]?.url,
          },
          duration: playbackData.item.duration_ms,
        } : null,
        progress: playbackData.progress_ms,
        volume: playbackData.device?.volume_percent,
        device: playbackData.device?.name,
        shuffle: playbackData.shuffle_state,
        repeat: playbackData.repeat_state,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting Spotify playback:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get playback state'
    }, { status: 500 });
  }
}

// POST control playback
export async function POST(request: NextRequest) {
  try {
    const { action, value } = await request.json();

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId: USER_ID },
    });

    if (!settings?.spotifyRefreshToken) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Not authenticated with Spotify'
      });
    }

    // Get credentials from database or environment
    let clientId = settings.spotifyClientId || process.env.SPOTIFY_CLIENT_ID!;
    let clientSecret = settings.spotifyClientSecret || process.env.SPOTIFY_CLIENT_SECRET!;

    // Decrypt secrets
    if (settings.spotifyClientSecret) {
      const decrypted = decryptFields(settings, ['spotifyClientSecret'] as any);
      clientSecret = decrypted.spotifyClientSecret;
    }

    // Get access token
    const refreshToken = decrypt(settings.spotifyRefreshToken);
    const accessToken = await getAccessToken(
      refreshToken,
      clientId,
      clientSecret
    );

    let endpoint = '';
    let method = 'PUT';
    let body = null;

    // Determine endpoint based on action
    switch (action) {
      case 'play':
        endpoint = `${SPOTIFY_API_BASE}/me/player/play`;
        break;
      case 'pause':
        endpoint = `${SPOTIFY_API_BASE}/me/player/pause`;
        break;
      case 'next':
        endpoint = `${SPOTIFY_API_BASE}/me/player/next`;
        method = 'POST';
        break;
      case 'previous':
        endpoint = `${SPOTIFY_API_BASE}/me/player/previous`;
        method = 'POST';
        break;
      case 'volume':
        endpoint = `${SPOTIFY_API_BASE}/me/player/volume?volume_percent=${value}`;
        break;
      case 'shuffle':
        endpoint = `${SPOTIFY_API_BASE}/me/player/shuffle?state=${value}`;
        break;
      case 'repeat':
        endpoint = `${SPOTIFY_API_BASE}/me/player/repeat?state=${value}`;
        break;
      case 'seek':
        endpoint = `${SPOTIFY_API_BASE}/me/player/seek?position_ms=${value}`;
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    // Make request to Spotify
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 403) {
      return NextResponse.json({
        success: false,
        error: 'Premium account required for playback control'
      }, { status: 403 });
    }

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      console.error('Spotify API error:', errorText);
      throw new Error('Failed to control playback');
    }

    return NextResponse.json({
      success: true,
      action,
    });
  } catch (error) {
    console.error('Error controlling Spotify playback:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to control playback'
    }, { status: 500 });
  }
}