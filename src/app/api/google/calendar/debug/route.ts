import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '@/lib/crypto';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const userId = 'dev-user-001';

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return NextResponse.json({
        error: 'No settings found',
      });
    }

    // Check credentials
    const clientId = settings.googleClientId?.trim() || process.env.GOOGLE_CLIENT_ID?.trim();

    // Decrypt the client secret if it comes from settings
    let clientSecret: string | undefined;
    let decryptionStatus = 'not_attempted';

    if (settings.googleClientSecret) {
      // The decrypt function now handles both encrypted and unencrypted data
      clientSecret = decrypt(settings.googleClientSecret)?.trim();
      decryptionStatus = clientSecret ? 'success' : 'failed';
    } else {
      clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
      decryptionStatus = 'using_env_var';
    }

    const diagnostics = {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0,
      clientSecretLength: clientSecret?.length || 0,
      clientSecretDecryptionStatus: decryptionStatus,
      storedSecretLength: settings.googleClientSecret?.length || 0,
      clientIdFormat: {
        startsCorrectly: clientId?.startsWith('2012'),
        endsCorrectly: clientId?.endsWith('.apps.googleusercontent.com'),
        hasSpaces: clientId?.includes(' ') || false,
        firstChars: clientId?.substring(0, 10),
        lastChars: clientId?.substring(clientId.length - 10),
      },
      clientSecretFormat: {
        hasSpaces: clientSecret?.includes(' ') || false,
        firstChars: clientSecret?.substring(0, 5),
        lastChars: clientSecret?.substring(clientSecret.length - 5),
      },
      refreshTokenStatus: {
        exists: !!settings.googleRefreshToken,
        canDecrypt: false,
      },
    };

    // Try to decrypt refresh token if it exists
    if (settings.googleRefreshToken) {
      try {
        const decrypted = decrypt(settings.googleRefreshToken);
        diagnostics.refreshTokenStatus.canDecrypt = true;
      } catch (e) {
        diagnostics.refreshTokenStatus.canDecrypt = false;
      }
    }

    // Check environment variables as fallback
    diagnostics.environmentVariables = {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      hasGoogleRedirectBase: !!process.env.GOOGLE_REDIRECT_BASE_URL,
      googleRedirectBase: process.env.GOOGLE_REDIRECT_BASE_URL,
      hasNextPublicAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    };

    return NextResponse.json({
      success: true,
      diagnostics,
      recommendations: generateRecommendations(diagnostics),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}

function generateRecommendations(diagnostics: any): string[] {
  const recommendations = [];

  if (!diagnostics.hasClientId || !diagnostics.hasClientSecret) {
    recommendations.push('Missing credentials. Please configure in Settings > Integrations');
  }

  if (diagnostics.clientIdFormat.hasSpaces) {
    recommendations.push('Client ID contains spaces - please remove them');
  }

  if (diagnostics.clientSecretFormat.hasSpaces) {
    recommendations.push('Client Secret contains spaces - please remove them');
  }

  if (!diagnostics.clientIdFormat.startsCorrectly || !diagnostics.clientIdFormat.endsCorrectly) {
    recommendations.push('Client ID format appears incorrect. Should be like: xxxxx.apps.googleusercontent.com');
  }

  if (!diagnostics.refreshTokenStatus.exists) {
    recommendations.push('No refresh token stored - authentication needed');
  } else if (!diagnostics.refreshTokenStatus.canDecrypt) {
    recommendations.push('Refresh token cannot be decrypted - may need to re-authenticate');
  }

  if (!diagnostics.environmentVariables.hasEncryptionKey) {
    recommendations.push('ENCRYPTION_KEY not set - required for storing tokens');
  }

  return recommendations;
}