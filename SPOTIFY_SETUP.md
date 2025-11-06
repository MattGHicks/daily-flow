# Spotify Web API Integration Setup

## Prerequisites

1. A Spotify account (free or premium)
2. Access to Spotify Developer Dashboard

## Setup Steps

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **Create an App**
4. Fill in the details:
   - App name: "Daily Flow Music"
   - App description: "Music integration for Daily Flow dashboard"
5. Check the required agreements
6. Click **Create**

### 2. Configure OAuth Settings

1. In your app settings, click **Edit Settings**
2. Add Redirect URIs:
   - For local development: `http://127.0.0.1:3000/api/spotify/callback`
   - For production: `https://your-domain.com/api/spotify/callback`
3. Save the settings

### 3. Get Your Credentials

1. In your app's dashboard, you'll find:
   - **Client ID**: Your app's unique identifier
   - **Client Secret**: Click "Show Client Secret" to reveal it

### 4. Add Credentials to Settings

The app uses credentials from the Settings page. You can:

**Option 1: Use Settings Page (Recommended)**
1. Go to `/dashboard/settings`
2. Enter your Spotify Client ID and Client Secret
3. Save the settings

**Option 2: Use Environment Variables (Optional)**
Add to your `.env` file:

```env
# Spotify OAuth (optional if using Settings page)
SPOTIFY_CLIENT_ID=your-client-id-here
SPOTIFY_CLIENT_SECRET=your-client-secret-here

# For production, also set:
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 5. Required Spotify Scopes

The integration requests these permissions:
- `user-read-playback-state` - Read current playback info
- `user-modify-playback-state` - Control playback
- `user-read-currently-playing` - See currently playing track
- `playlist-read-private` - Access your playlists
- `playlist-read-collaborative` - Access collaborative playlists
- `user-library-read` - Access saved tracks
- `user-read-recently-played` - Access recently played
- `user-top-read` - Access top tracks/artists

### 6. Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://127.0.0.1:3000/dashboard/music` (use 127.0.0.1, not localhost)
3. Click "Connect Spotify"
4. Authorize the requested permissions
5. You should be redirected back with music controls

## Features

Once connected, you can:
- View currently playing track with album artwork
- Control playback (play/pause, skip, previous)
- Adjust volume
- See playback progress
- Browse your playlists
- View recently played tracks
- See your top tracks
- Search for songs

## Troubleshooting

### Error: "Invalid redirect URI"
- Ensure the redirect URI in your app settings matches exactly
- Check for trailing slashes or protocol differences

### Error: "Invalid client"
- Verify Client ID and Secret are correct
- Ensure no extra spaces in environment variables

### No playback device found
- Spotify needs an active device (phone, desktop app, or web player)
- Start playing music on any Spotify client first

### Premium Features
Some features require Spotify Premium:
- Playback control (play/pause/skip)
- Seeking to position
- Volume control

Free accounts can still:
- View current playback
- Browse playlists
- View recently played

## API Rate Limits

Spotify API has these limits:
- Default: 180 requests per minute
- Increased limits available for approved apps

## Security Notes

- Never expose your Client Secret in client-side code
- Refresh tokens are encrypted before storage
- Use HTTPS in production
- Tokens expire after 1 hour (automatically refreshed)