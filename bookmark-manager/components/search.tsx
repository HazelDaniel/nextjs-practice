// Higher-level concept: Client Components — 'use client' is the boundary.
// Required for interactivity: state, event handlers, and browser-only APIs.
// Everything this module imports joins the client bundle, which is WHY we keep
// Server Components (DB reads) out of it.
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'

export default function Search() {
  // Client-side navigation hooks: read the current URL and push new ones
  // WITHOUT a full page reload. Keeping 'q' in the URL means results are
  // shareable/bookmarkable, and the server re-filters via searchParams.
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  const qParam = searchParams.get('q') ?? ''
  if (value !== qParam) {
    setValue(qParam)
  }

  function handleSubmit(formData: FormData) {
    const q = String(formData.get('q') ?? '').trim()
    // useTransition: keeps the UI responsive while router.push triggers the
    // server round trip that re-renders the filtered page.
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q) params.set('q', q)
      else params.delete('q')
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  return (
    <form action={handleSubmit} className="flex items-center gap-2">
      <input
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search bookmarks, tags..."
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? '...' : 'Search'}
      </button>
    </form>
  )
}