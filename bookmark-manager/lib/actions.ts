// Higher-level concept: Server Actions — this file IS the server boundary.
// 'use server' marks every export as a server-only async function the client
// can call directly (via <form>, event handlers, or React hooks). Each call is
// a POST round trip that runs here, with full DB access, without ever shipping
// this code to the browser.
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from './prisma'
import { getCurrentUser } from './data'
import { verifyPassword } from './password'
import { createSession, destroySession } from './auth'

export type ActionState = {
  errors?: Record<string, string[]>
  message?: string | null
  success?: boolean
}

function errorsFromIssues(issues: z.core.$ZodIssue[]): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] = [...(errors[key] ?? []), issue.message]
  }
  return errors
}

const bookmarkSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title is too long'),
  url: z.string().trim().min(1, 'URL is required').url('Must be a valid URL'),
  description: z.string().trim().max(500).optional(),
  collection: z.string().trim().optional(),
  tags: z.string().trim().optional(),
})

export async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // (prevState, formData) same shape as createBookmark — used by useActionState
  // in components/login-form.tsx.
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/')

  const user = await prisma.user.findUnique({ where: { email } })
  // Same generic message whether the email exists or the password is wrong —
  // never reveal which part failed (prevents account enumeration).
  if (!user || !verifyPassword(password, user.password)) {
    return { message: 'Incorrect email or password.', success: false }
  }

  // Sets the HttpOnly session cookie and persists the session row.
  await createSession(user.id)

  // After identity changes we must invalidate cached layouts/data (the header)
  // before the redirect target re-renders with the user's own content.
  revalidatePath('/', 'layout')
  redirect(safeNext(next))
}

// Only allow local relative redirects after login (blocks open redirects).
function safeNext(next: string): string {
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export async function signOut() {
  destroySession()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function createBookmark(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // (prevState, formData) matches the useActionState signature in
  // new-bookmark-form.tsx; prevState carries the previous run's errors.
  const user = await getCurrentUser()
  if (!user) {
    return { message: 'You must be logged in.', success: false }
  }

  const parsed = bookmarkSchema.safeParse({
    title: formData.get('title'),
    url: formData.get('url'),
    description: formData.get('description'),
    collection: formData.get('collection'),
    tags: formData.get('tags'),
  })

  if (!parsed.success) {
    return { errors: errorsFromIssues(parsed.error.issues), success: false }
  }

  const data = parsed.data
  const tagNames = (data.tags ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  await prisma.bookmark.create({
    data: {
      title: data.title,
      url: data.url,
      description: data.description || null,
      collectionId: data.collection || null,
      userId: user.id,
      tags: {
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  })

  // Higher-level concept: revalidation after a mutation.
  // revalidatePath() invalidates the data + router caches for '/', so the next
  // render shows fresh DB state instead of a stale cached shell. It must run
  // BEFORE redirect — which throws and stops everything below it.
  revalidatePath('/')
  redirect('/')
}

export async function deleteBookmark(formData: FormData) {
  const user = await getCurrentUser()
  const id = formData.get('id')
  if (!user || typeof id !== 'string') return

  await prisma.bookmark.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/')
}

export async function toggleArchive(formData: FormData) {
  const user = await getCurrentUser()
  const id = formData.get('id')
  if (!user || typeof id !== 'string') return

  const bookmark = await prisma.bookmark.findFirst({ where: { id, userId: user.id } })
  if (!bookmark) return

  await prisma.bookmark.update({
    where: { id },
    data: { status: bookmark.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE' },
  })
  revalidatePath('/')
}

export async function incrementClicks(id: string) {
  if (typeof id !== 'string' || !id) return

  await prisma.bookmark.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  })
}

export async function createCollection(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) {
    return { message: 'You must be logged in.', success: false }
  }

  const name = formData.get('name')
  if (typeof name !== 'string' || !name.trim()) {
    return { errors: { name: ['Name is required'] }, success: false }
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  await prisma.collection.create({
    data: { name: name.trim(), slug, userId: user.id },
  })

  revalidatePath('/')
  return { success: true, message: 'Collection created.' }
}