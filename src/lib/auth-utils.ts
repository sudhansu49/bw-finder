import { createHash, randomBytes, pbkdf2Sync } from 'crypto'

const ITERATIONS = 10000
const KEY_LENGTH = 64
const DIGEST = 'sha512'

/**
 * Creates a hashed password using PBKDF2 with a random salt.
 * Returns a string in the format: iterations:salt:hash
 */
export function createHashedPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex')
  return `${ITERATIONS}:${salt}:${hash}`
}

/**
 * Verifies a password against a stored hash.
 * The stored hash should be in the format: iterations:salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [iterationsStr, salt, hash] = storedHash.split(':')
  const iterations = parseInt(iterationsStr, 10)
  const computedHash = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString('hex')
  return computedHash === hash
}
