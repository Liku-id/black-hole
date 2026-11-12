import crypto from 'crypto';

import { encrypt, encryptUtils } from './encryptUtils';

describe('encryptUtils', () => {
  const originalEnv = process.env.SECRET_PREVIEW_TOKEN;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.SECRET_PREVIEW_TOKEN;
    } else {
      process.env.SECRET_PREVIEW_TOKEN = originalEnv;
    }
  });

  it('throws when no key is provided and SECRET_PREVIEW_TOKEN is unset', () => {
    delete process.env.SECRET_PREVIEW_TOKEN;
    expect(() => encrypt('payload')).toThrow(
      'Encryption key is required. Set SECRET_PREVIEW_TOKEN'
    );
  });

  it('encrypts with explicit key and can be decrypted back with AES-256-CBC', () => {
    const key = 'my-short-secret-key';
    const token = encrypt('event-123', key);

    const [ivB64, encryptedB64] = token.split(':');
    expect(ivB64).toBeTruthy();
    expect(encryptedB64).toBeTruthy();

    const keyBuffer = Buffer.from(key.slice(0, 32).padEnd(32, '0'));
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      keyBuffer,
      Buffer.from(ivB64, 'base64')
    );
    let decrypted = decipher.update(encryptedB64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    expect(decrypted).toBe('event-123');
  });

  it('uses process.env.SECRET_PREVIEW_TOKEN when key argument is omitted', () => {
    process.env.SECRET_PREVIEW_TOKEN = '12345678901234567890123456789012';
    const token = encryptUtils.encrypt('secret-preview');

    expect(token).toContain(':');
  });
});
