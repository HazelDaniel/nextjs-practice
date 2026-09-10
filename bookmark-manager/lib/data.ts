// Higher-level concept: the Server/Client code boundary.
// 'server-only' makes the build FAIL if this module is ever imported from a
// Client Component — enforcing that DB queries & secrets never leak to the
// browser bundle.
import 'server-only'
import { cache } from 'react'
import type { Prisma } from '@/app/generated/prisma/client'
import { prisma } from './prisma'

export type BookmarkWithRelations = Prisma.BookmarkGetPayload<{
  include: { tags: true; collection: true }
}>

// Higher-level concept: request-scoped memoization (React.cache).
// Dedupes identical calls WITHIN a single request — e.g. the homepage's
// <Sidebar> and <BookmarkList> share one query result. It does NOT persist
// across requests; that's what `use cache` (Cache Components) is for.
export const getBookmarks = cache(
  async (userId: string, search?: string, collectionSlug?: string) => {
    return prisma.bookmark.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        ...(collectionSlug
          ? { collection: { slug: collectionSlug } }
          : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
                { tags: { some: { name: { contains: search } } } },
              ],
            }
          : {}),
      },
      include: { tags: true, collection: true },
      orderBy: { createdAt: 'desc' },
    })
  },
)

export const getBookmark = cache(async (userId: string, id: string) => {
  return prisma.bookmark.findFirst({
    where: { id, userId },
    include: { tags: true, collection: true },
  })
})

export const getCollections = cache(async (userId: string) => {
  return prisma.collection.findMany({
    where: { userId },
    include: { _count: { select: { bookmarks: true } } },
    orderBy: { name: 'asc' },
  })
})

export const getTags = cache(async (userId: string) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { tags: true },
  })
  const counts = new Map<string, number>()
  for (const b of bookmarks) {
    for (const t of b.tags) counts.set(t.name, (counts.get(t.name) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

export const getStats = cache(async (userId: string) => {
  const [total, collections, tags] = await Promise.all([
    prisma.bookmark.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.tag.count(),
  ])
  return { total, collections, tags }
})

// Re-export the session-based identity lookup so every existing call site
// (`getCurrentUser`) now resolves the CURRENT request's user instead of the
// seeded demo user. Identity always comes from the cookie via lib/auth.ts.
export { getSessionUser as getCurrentUser } from './auth'