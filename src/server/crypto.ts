import crypto from 'crypto';

const LEGACY_SALT = 'pearl-pick-couture-salt-2026';

/**
 * Generates a salted scrypt hash in the format `<16-byte-hex-salt>:<64-byte-hex-hash>`.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

/**
 * Verifies a password against a stored `salt:hash` using timingSafeEqual.
 * Also supports legacy single-salt hashes for seamless migration.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  try {
    if (storedHash.includes(':')) {
      const [salt, keyHex] = storedHash.split(':');
      if (!salt || !keyHex) return false;
      const keyBuf = Buffer.from(keyHex, 'hex');
      const derivedBuf = crypto.scryptSync(password, salt, 64);
      if (keyBuf.length !== derivedBuf.length) return false;
      return crypto.timingSafeEqual(keyBuf, derivedBuf);
    } else {
      const keyBuf = Buffer.from(storedHash, 'hex');
      const derivedBuf = crypto.scryptSync(password, LEGACY_SALT, 64);
      if (keyBuf.length !== derivedBuf.length) return false;
      return crypto.timingSafeEqual(keyBuf, derivedBuf);
    }
  } catch {
    return false;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
