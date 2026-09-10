import Link from 'next/link'
import { deleteBookmark, toggleArchive } from '@/lib/actions'
import type { BookmarkWithRelations } from '@/lib/data'

function Favicon({ url }: { url: string }) {
  const host = new URL(url).hostname
  const letter = (host[0] ?? '?').toUpperCase()
  const palette = [
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
  ]
  const color = palette[host.length % palette.length]
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold ${color}`}
      title={host}
    >
      {letter}
    </span>
  )
}

// Presentational Server Component: no 'use client', no hooks. Renders as
// server-produced markup, composed with Client Components and Server Actions.
export default function BookmarkCard({ bookmark }: { bookmark: BookmarkWithRelations }) {
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex items-start gap-3">
        <Favicon url={bookmark.url} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Link href={`/bookmarks/${bookmark.id}`} className="hover:underline">
              {bookmark.title}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{bookmark.url}</p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {bookmark.clicks} clicks
        </span>
      </div>

      {bookmark.description && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {bookmark.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {bookmark.collection && (
          <Link
            href={`/collections/${bookmark.collection.slug}`}
            className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {bookmark.collection.name}
          </Link>
        )}
        {bookmark.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/?q=${encodeURIComponent(tag.name)}`}
            className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            #{tag.name}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Visit →
        </a>
        <div className="flex gap-2">
          {/* Higher-level concept: Server Actions with progressive enhancement.
              A <form action={serverAction}> posts over the network under the
              hood but works even BEFORE JavaScript loads — the browser submits
              natively. Hidden FormData fields arrive as the action's argument.
              (Contrast: useActionState form in new-bookmark-form.tsx, and the
              direct-call pattern in track-visit.tsx.) */}
          <form action={toggleArchive}>
            <input type="hidden" name="id" value={bookmark.id} />
            <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              {bookmark.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
            </button>
          </form>
          <form
            action={deleteBookmark}
            className="[&>button]:text-red-500"
          >
            <input type="hidden" name="id" value={bookmark.id} />
            <button className="text-xs hover:text-red-700">Delete</button>
          </form>
        </div>
      </div>
    </article>
  )
}