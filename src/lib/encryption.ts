import crypto from 'crypto';

// Encryption key should be stored in environment variables
// Generate a key with: openssl rand -hex 32
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-please-change-in-production-32bytes!!';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts sensitive data like API keys
 * @param text - The text to encrypt
 * @returns The encrypted text in format: iv:encryptedData
 */
export function encrypt(text: string): string {
  if (!text) return '';

  const iv = crypto.randomBytes(IV_LENGTH);
  // Parse hex key (64 hex chars = 32 bytes) or use first 32 chars as utf8 fallback
  const key = ENCRYPTION_KEY.length === 64
    ? Buffer.from(ENCRYPTION_KEY, 'hex')
    : Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8');

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts encrypted data
 * @param text - The encrypted text in format: iv:encryptedData
 * @returns The decrypted text
 */
export function decrypt(text: string): string {
  if (!text) return '';

  try {
    const [ivHex, encryptedData] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    // Parse hex key (64 hex chars = 32 bytes) or use first 32 chars as utf8 fallback
    const key = ENCRYPTION_KEY.length === 64
      ? Buffer.from(ENCRYPTION_KEY, 'hex')
      : Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

/**
 * Encrypts an object's sensitive fields
 * @param obj - Object with sensitive fields
 * @param fields - Array of field names to encrypt
 * @returns Object with encrypted fields
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as T[keyof T];
    }
  }

  return result;
}

/**
 * Decrypts an object's encrypted fields
 * @param obj - Object with encrypted fields
 * @param fields - Array of field names to decrypt
 * @returns Object with decrypted fields
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decrypt(result[field] as string) as T[keyof T];
    }
  }

  return result;
}
