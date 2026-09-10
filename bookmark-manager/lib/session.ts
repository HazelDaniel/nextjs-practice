// Higher-level concept: signed, stateless cookie values.
// The cookie stores "<token>.<expiresAtUnixMs>" with an HMAC signature appended
// ("<payload>.<signature>"). Two consumers use it:
//   1. proxy.ts — verifies the signature + TTL with NO database access (a fast,
//      cheap gate that runs on every protected request).
//   2. the app — unsigns it and looks up the session row in the DB for the
//      authoritative, revocable check (deleting the row invalidates the cookie).
// This module intentionally imports nothing from this app or from next/* so the
// proxy and Node scripts can use it without side effects.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'session'
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set (see .env)')
  return secret
}

function hmac(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

// Signs any string so it can be stored as a cookie value.
export function sign(value: string): string {
  return `${value}.${hmac(value)}`
}

// Returns the original value if the signature is valid, otherwise null.
export function unsign(signed: string): string | null {
  const sep = signed.lastIndexOf('.')
  if (sep === -1) return null
  const value = signed.slice(0, sep)
  const provided = signed.slice(sep + 1)
  const expected = Buffer.from(hmac(value), 'hex')
  const actual = Buffer.from(provided, 'hex')
  if (expected.length !== actual.length) return null
  return timingSafeEqual(expected, actual) ? value : null
}

// Proxy-side gate: cheap signature + TTL check only (no DB round trip).
export function hasValidSessionCookie(value?: string): boolean {
  if (!value) return false
  const unsigned = unsign(value)
  if (!unsigned) return false
  const [token, expMs] = unsigned.split('.')
  if (!token || !expMs) return false
  return Date.now() < Number(expMs)
}

// Creates the one-time random token (stored in the DB) and the signed cookie
// value (sent to the browser). The two are paired only via the signature.
export function makeSessionTokenAndCookie(): { token: string; cookieValue: string } {
  const token = randomBytes(32).toString('base64url')
  const expMs = Date.now() + SESSION_TTL_MS
  return { token, cookieValue: sign(`${token}.${expMs}`) }
}

// Extracts the raw DB token from a signed cookie value (returns null if bad).
export function tokenFromCookie(value?: string): string | null {
  if (!value) return null
  const unsigned = value ? unsign(value) : null
  if (!unsigned) return null
  const [token] = unsigned.split('.')
  return token ?? null
}