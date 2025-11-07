import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

// Get encryption key from environment or generate a default one
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  // Ensure key is 32 bytes for AES-256
  return crypto.createHash('sha256').update(key).digest();
};

export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted text
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedData: string): string {
  try {
    // Check if data appears to be encrypted (has colon separator)
    if (!encryptedData || !encryptedData.includes(':')) {
      console.log('Data does not appear to be encrypted, returning as-is');
      return encryptedData || '';
    }

    const key = getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 2) {
      // If not in expected format, assume it's not encrypted
      console.log('Invalid encrypted format, returning as-is');
      return encryptedData;
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return original data if decryption fails - it might not be encrypted
    console.log('Decryption failed, returning original data');
    return encryptedData;
  }
}