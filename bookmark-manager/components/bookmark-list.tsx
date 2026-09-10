import BookmarkCard from './bookmark-card'
import { getBookmarks, getCurrentUser } from '@/lib/data'

// Higher-level concept: Server Components.
// Default component type: async, runs ONLY on the server, and can query the
// database directly via Prisma — no API layer or fetch round trip needed, and
// SQL/credentials never reach the client bundle. This is where the route's
// dynamic data lives; the parent awaits it inside its <Suspense> boundary.
export default async function BookmarkList({
  searchParams,
  collectionSlug,
}: {
  searchParams: Promise<{ q?: string }>
  collectionSlug?: string
}) {
  const user = await getCurrentUser()
  const { q } = await searchParams
  const bookmarks = user ? await getBookmarks(user.id, q ?? '', collectionSlug) : []

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {q ? `No bookmarks match “${q}”.` : 'No bookmarks yet.'}
        </p>
        <a
          href="/new"
          className="mt-2 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
        >
          Add your first bookmark
        </a>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  )
}