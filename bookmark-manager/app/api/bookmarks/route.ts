// Higher-level concept: Route Handlers — the HTTP/API layer of the App Router.
// A route.ts file exports HTTP-method functions that take the Web `Request`
// and return a `Response`. Unlike Server Actions (app-facing mutations in
// lib/actions.ts), these are plain endpoints for external/programmatic use.
import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getBookmarks, getCurrentUser } from '@/lib/data'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ error: 'Not authorized' }, { status: 401 })
  }

  // Query string is read through the Web API: request.nextUrl.searchParams.
  const q = request.nextUrl.searchParams.get('q') ?? undefined
  const collection = request.nextUrl.searchParams.get('collection') ?? undefined
  const bookmarks = await getBookmarks(user.id, q, collection)

  return Response.json(bookmarks)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ error: 'Not authorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, url, description, collectionId, tags } = body as {
    title?: string
    url?: string
    description?: string
    collectionId?: string
    tags?: string[]
  }

  if (!title || !url) {
    return Response.json({ error: 'title and url are required' }, { status: 400 })
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      title,
      url,
      description: description ?? null,
      collectionId: collectionId ?? null,
      userId: user.id,
      tags: tags
        ? {
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          }
        : undefined,
    },
    include: { tags: true, collection: true },
  })

  // Key contrast that explains WHEN to pick each API:
  // a mutation via a Route Handler does NOT re-render the UI — the cache is
  // only refreshed because we call revalidatePath() ourselves. Server Actions
  // re-render the current route automatically after a mutation.
  revalidatePath('/')

  return Response.json(bookmark, { status: 201 })
}