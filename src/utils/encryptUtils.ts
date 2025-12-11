/**
 * Encryption utilities for encrypting preview tokens (server-side only)
 * Decryption is handled in black-void
 */

import crypto from 'crypto';

/**
 * Get encryption key from environment variable
 * In production, should use SECRET_PREVIEW_TOKEN from env
 */
const getEncryptionKey = (): string => {
  return process.env.SECRET_PREVIEW_TOKEN || '';
};

/**
 * Encrypt string with AES-256-CBC using key (server-side only)
 * @param data - String to encrypt
 * @param key - Encryption key (optional, will use env variable if not provided)
 * @returns Base64 encoded encrypted string (format: iv:encryptedData)
 */
export const encrypt = (data: string, key?: string): string => {
  const encryptionKey = key || getEncryptionKey();
  
  if (!encryptionKey) {
    throw new Error('Encryption key is required. Set SECRET_PREVIEW_TOKEN');
  }
  
  // Server-side only (used in API route)
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(encryptionKey.slice(0, 32).padEnd(32, '0'));
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Return iv:encryptedData format
  return `${iv.toString('base64')}:${encrypted}`;
};

export const encryptUtils = {
  encrypt
};

