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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '20';

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

    // Fetch user's playlists
    const playlistsResponse = await fetch(
      `${SPOTIFY_API_BASE}/me/playlists?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!playlistsResponse.ok) {
      throw new Error('Failed to fetch playlists');
    }

    const playlistsData = await playlistsResponse.json();

    // Fetch recently played tracks
    const recentResponse = await fetch(
      `${SPOTIFY_API_BASE}/me/player/recently-played?limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    let recentTracks = [];
    if (recentResponse.ok) {
      const recentData = await recentResponse.json();
      recentTracks = recentData.items.map((item: any) => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map((a: any) => a.name),
        album: {
          name: item.track.album.name,
          image: item.track.album.images[0]?.url,
        },
        playedAt: item.played_at,
      }));
    }

    // Fetch top tracks
    const topTracksResponse = await fetch(
      `${SPOTIFY_API_BASE}/me/top/tracks?limit=10&time_range=short_term`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    let topTracks = [];
    if (topTracksResponse.ok) {
      const topData = await topTracksResponse.json();
      topTracks = topData.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((a: any) => a.name),
        album: {
          name: track.album.name,
          image: track.album.images[0]?.url,
        },
        popularity: track.popularity,
      }));
    }

    // Format playlists
    const playlists = playlistsData.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image: playlist.images[0]?.url,
      tracksCount: playlist.tracks.total,
      owner: playlist.owner.display_name,
      public: playlist.public,
    }));

    return NextResponse.json({
      success: true,
      playlists,
      recentTracks,
      topTracks,
      total: playlistsData.total,
    });
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch playlists'
    }, { status: 500 });
  }
}