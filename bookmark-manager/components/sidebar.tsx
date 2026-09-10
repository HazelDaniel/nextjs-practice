import Link from 'next/link'
import { getCollections, getCurrentUser, getTags } from '@/lib/data'

export default async function Sidebar() {
  const user = await getCurrentUser()
  if (!user) return null

  const [collections, tags] = await Promise.all([
    getCollections(user.id),
    getTags(user.id),
  ])

  return (
    <aside className="w-full shrink-0 space-y-8 md:w-56">
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Collections ({collections.length})
        </h2>
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className="block rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              All bookmarks
            </Link>
          </li>
          {collections.map((c) => (
            <li key={c.id}>
              <Link
                href={`/collections/${c.slug}`}
                className="flex items-center justify-between rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <span>{c.name}</span>
                <span className="text-xs text-zinc-400">{c._count.bookmarks}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Top tags
        </h2>
        {tags.length === 0 ? (
          <p className="px-2 text-sm text-zinc-500">No tags yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {tags.slice(0, 10).map((t) => (
              <li key={t.name}>
                <Link
                  href={`/?q=${encodeURIComponent(t.name)}`}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  #{t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}