import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptFields, decryptFields } from '@/lib/encryption';

// Fields that should be encrypted
const SENSITIVE_FIELDS = [
  'mondayApiKey',
  'redmineApiKey',
  'googleClientSecret',
  'spotifyClientSecret',
];

// Temporary user ID for development (will be replaced with actual auth)
const DEV_USER_ID = 'dev-user-001';

/**
 * GET /api/settings
 * Retrieves user settings and decrypts sensitive fields
 */
export async function GET() {
  try {
    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: DEV_USER_ID },
      include: { settings: true },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEV_USER_ID,
          email: 'dev@dailyflow.local',
          name: 'Development User',
        },
        include: { settings: true },
      });
    }

    // If no settings exist, create default settings
    if (!user.settings) {
      const defaultSettings = await prisma.userSettings.create({
        data: {
          userId: DEV_USER_ID,
          theme: 'dark',
          compactMode: false,
          animationsEnabled: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: defaultSettings,
      });
    }

    // Decrypt sensitive fields before returning
    const decryptedSettings = decryptFields(user.settings, SENSITIVE_FIELDS as (keyof typeof user.settings)[]);

    return NextResponse.json({
      success: true,
      data: decryptedSettings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Updates user settings and encrypts sensitive fields
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body is required',
        },
        { status: 400 }
      );
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: DEV_USER_ID },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEV_USER_ID,
          email: 'dev@dailyflow.local',
          name: 'Development User',
        },
      });
    }

    // Encrypt sensitive fields before saving
    const encryptedData = encryptFields(body, SENSITIVE_FIELDS);

    // Update or create settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: DEV_USER_ID },
      update: encryptedData,
      create: {
        userId: DEV_USER_ID,
        ...encryptedData,
      },
    });

    // Decrypt before returning
    const decryptedSettings = decryptFields(settings, SENSITIVE_FIELDS as (keyof typeof settings)[]);

    return NextResponse.json({
      success: true,
      data: decryptedSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings
 * Clears specific settings fields
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field');

    if (!field) {
      return NextResponse.json(
        {
          success: false,
          error: 'Field parameter is required',
        },
        { status: 400 }
      );
    }

    const settings = await prisma.userSettings.update({
      where: { userId: DEV_USER_ID },
      data: {
        [field]: null,
      },
    });

    // Decrypt before returning
    const decryptedSettings = decryptFields(settings, SENSITIVE_FIELDS as (keyof typeof settings)[]);

    return NextResponse.json({
      success: true,
      data: decryptedSettings,
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete setting',
      },
      { status: 500 }
    );
  }
}
