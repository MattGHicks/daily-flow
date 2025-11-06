# Google Calendar Integration Setup

## Prerequisites

1. A Google Cloud Console account
2. A project in Google Cloud Console

## Setup Steps

### 1. Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Library**
4. Search for "Google Calendar API"
5. Click on it and press **Enable**

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Daily Flow"
     - User support email: Your email
     - Developer contact: Your email
   - Add scope (READ-ONLY):
     - `https://www.googleapis.com/auth/calendar.readonly`
   - Add test users if in development

### 3. Configure OAuth Client

1. Application type: **Web application**
2. Name: "Daily Flow Calendar"
3. **IMPORTANT** Add Authorized redirect URIs:
   - For local development: `http://localhost:3000/api/google/calendar/callback`
   - **Note**: Use `localhost` NOT `127.0.0.1` for Google OAuth
   - For production: `https://your-domain.com/api/google/calendar/callback`
4. Click **Create**
5. Save your **Client ID** and **Client Secret**

### 4. Configure Environment Variables

Add to your `.env` file:

```env
# Application URL (can use 127.0.0.1 for other services like Spotify)
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000

# Google OAuth specific URL (MUST use localhost for Google OAuth)
GOOGLE_REDIRECT_BASE_URL=http://localhost:3000

# Google OAuth credentials (stored in database, configured via Settings page)
# You can optionally set these as fallback values:
# GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=your-client-secret-here

# Encryption key for storing refresh tokens
ENCRYPTION_KEY=generate-a-strong-32-character-random-key
```

**Note**: The app uses `127.0.0.1` for general access to support services like Spotify OAuth, but Google OAuth requires `localhost`. The `GOOGLE_REDIRECT_BASE_URL` ensures Google OAuth works correctly.

### 5. Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Important Security Notes

- **Never commit** your `.env` file to version control
- **Client Secret** should only be used server-side
- **Refresh tokens** are automatically encrypted before storage
- In production, use environment variables from your hosting provider

### 7. Configure Google Credentials in Daily Flow

1. Navigate to Settings: `http://127.0.0.1:3000/dashboard/settings`
2. Go to the "Integrations" tab
3. Find Google Calendar and click "Configure"
4. Enter your Client ID and Client Secret from Google Cloud Console
5. Click "Save Integration Settings"

### 8. Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to Calendar page: `http://127.0.0.1:3000/dashboard/calendar`
3. Click "Connect Google Calendar"
4. You'll be redirected to Google (notice the URL uses `localhost`)
5. Sign in with your Google account
6. Authorize the requested permissions (read-only calendar access)
7. You should be redirected back and see your calendar events

### Troubleshooting

#### Error 400: "The server cannot process the request because it is malformed"
- **Most common cause**: Redirect URI mismatch
- Verify in Google Cloud Console that the redirect URI is exactly: `http://localhost:3000/api/google/calendar/callback`
- Do NOT use `http://127.0.0.1:3000` in Google Cloud Console
- Check that `GOOGLE_REDIRECT_BASE_URL` is set to `http://localhost:3000` in your `.env` file
- Ensure Client ID and Client Secret are correctly entered in Settings

#### Error: "Access blocked: Authorization Error"
- Ensure redirect URI in Google Console matches exactly
- Check that both Client ID and Secret are correctly set in Settings page
- Verify the OAuth consent screen is configured
- If in testing mode, ensure your Google account is added as a test user

#### Error: "invalid_grant"
- The refresh token has expired or been revoked
- Re-authenticate by clicking "Connect Google Calendar" again

#### No events showing
- Check that you have events in your primary calendar
- Verify the calendar API is enabled in Google Console
- Check browser console for any API errors

### Production Deployment

When deploying to production:

1. Add your production domain to Authorized redirect URIs
2. Set all environment variables in your hosting provider
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. Use a strong, unique `ENCRYPTION_KEY`
5. Consider moving OAuth consent screen from "Testing" to "Production"

## API Limits

Google Calendar API has the following limits:
- 1,000,000 requests per day
- 10 requests per second per user

For most applications, these limits are more than sufficient.