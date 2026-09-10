import { notFound } from 'next/navigation'
import Link from 'next/link'
import TrackVisit from '@/components/track-visit'
import { deleteBookmark } from '@/lib/actions'
import { getBookmark, getCurrentUser } from '@/lib/data'

// Higher-level concept: dynamic SEO metadata.
// generateMetadata runs before render (per request) and lets this route
// override the <title> set in the root layout's `template` — e.g. dynamic
// "Next.js Docs | Linkify" instead of a static title.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  const { id } = await params
  const bookmark = user ? await getBookmark(user.id, id) : null

  return {
    title: bookmark?.title ?? 'Bookmark not found',
  }
}

export default async function BookmarkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Dynamic segment: the [id] folder matches /bookmarks/<anything>, and the
  // value arrives via `params` — a PROMISE in Next 16 that must be awaited.
  const user = await getCurrentUser()
  const { id } = await params
  const bookmark = user ? await getBookmark(user.id, id) : null

  // notFound(): stops rendering this tree and renders the nearest not-found
  // UI (see app/not-found.tsx) with a 404 response.
  if (!bookmark) notFound()

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <TrackVisit id={bookmark.id} />

      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Back to bookmarks
        </Link>
      </div>

      <article className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {bookmark.title}
        </h1>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block break-all text-sm text-zinc-500 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
        >
          {bookmark.url}
        </a>

        {bookmark.description && (
          <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {bookmark.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {bookmark.collection && (
            <Link
              href={`/collections/${bookmark.collection.slug}`}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {bookmark.collection.name}
            </Link>
          )}
          {bookmark.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/?q=${encodeURIComponent(tag.name)}`}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            >
              #{tag.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-zinc-800">
          <span>
            Created {bookmark.createdAt.toLocaleDateString()} · {bookmark.clicks} clicks
          </span>
          <form action={deleteBookmark}>
            <input type="hidden" name="id" value={bookmark.id} />
            <button className="text-red-500 hover:text-red-700">Delete</button>
          </form>
        </div>
      </article>
    </div>
  )
}