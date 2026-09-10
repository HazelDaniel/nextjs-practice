// Higher-level concept: never store plaintext passwords.
// scrypt is a deliberately slow, memory-hard KDF — brute-forcing the resulting
// hash is expensive. Each password gets a unique random salt; the stored value
// is "salt:derivedKey" so verification can recompute with the same salt.
// We use node:crypto here (no external dependency like bcrypt), and this module
// is pure — it runs in seeds/scripts as well as the app.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const derived = scryptSync(password, salt, KEY_LENGTH)
  const expected = Buffer.from(key, 'hex')
  // timingSafeEqual keeps the comparison constant-time (no early exit on a
  // wrong byte), which mitigates timing-based password guessing attacks.
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}