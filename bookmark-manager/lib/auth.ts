// Higher-level concept: cookie-based authentication.
// This module ties the pure crypto helpers (lib/session.ts, lib/password.ts) to
// the Next.js runtime: it reads/writes the session cookie via the `cookies()`
// API and validates the session row in the database. The flow:
//   login action  -> createSession()   sets the cookie + saves a DB row
//   any request   -> getSessionUser()  unsigns cookie -> DB lookup -> user
//   signOut       -> destroySession()  deletes the DB row + clears the cookie
//
// Trust model: the SIGNATURE proves the cookie was issued by us; the DB ROW
// gives the authoritative "is this session still live?" answer (sessions are
// revocable — delete the row and the cookie dies). The proxy.ts gate only does
// the cheap signature+TTL check; every server action / route handler re-checks
// here (defense in depth — see lib/actions.ts).
import 'server-only'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  makeSessionTokenAndCookie,
  tokenFromCookie,
} from './session'

/**
 * Returns the user bound to the request's session cookie, or null.
 * Also lazily expires rows whose TTL has passed (so dead sessions get cleaned).
 */
export async function getSessionUser() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value
  const token = tokenFromCookie(value)
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }
  return session.user
}

/** Creates a session for a user and sets the session cookie on the response. */
export async function createSession(userId: string) {
  const { token, cookieValue } = makeSessionTokenAndCookie()

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  })

  const cookieStore = await cookies()
  cookieStore.set({
    name: SESSION_COOKIE,
    value: cookieValue,
    httpOnly: true, // JS can't read it -> immune to XSS cookie theft
    sameSite: 'lax', // sent on top-level navigations, not cross-site subrequests
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

/** Deletes the session row and clears the cookie. */
export async function destroySession() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value
  const token = tokenFromCookie(value)
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  const cookieStore = await cookies()
  cookieStore.set({ name: SESSION_COOKIE, value: '', maxAge: 0, path: '/' })
}