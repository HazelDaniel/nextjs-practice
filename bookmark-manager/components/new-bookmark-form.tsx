'use client'

import { use, useActionState } from 'react'
import Link from 'next/link'
import { createBookmark, type ActionState } from '@/lib/actions'

export default function NewBookmarkForm({
  collections,
}: {
  collections: Promise<{ id: string; name: string }[]>
}) {
  // Higher-level concept: streaming server data into a Client Component.
  // The parent page passes an UNRESOLVED promise; React's use() resolves it
  // here, suspending until the query completes so the parent's <Suspense>
  // fallback shows. This avoids waiting for the DB before the shell renders.
  const collectionOptions = use(collections)

  // Higher-level concept: Server Action + React 19 state handling.
  // useActionState wraps createBookmark: it feeds it (prevState, formData),
  // exposes the action's return value (errors here) and a 'pending' flag used
  // for the submit label. Replaces manual useState + form handling.
  const [state, action, pending] = useActionState<ActionState, FormData>(createBookmark, {})

  return (
    <form action={action} className="space-y-4">
      {state.message && (
        <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="e.g. Next.js Documentation"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {state.errors?.title?.map((e) => (
          <p key={e} className="mt-1 text-xs text-red-500">{e}</p>
        ))}
      </div>

      <div>
        <label htmlFor="url" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://nextjs.org/docs"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {state.errors?.url?.map((e) => (
          <p key={e} className="mt-1 text-xs text-red-500">{e}</p>
        ))}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Short summary..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="collection" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Collection
          </label>
          <select
            id="collection"
            name="collection"
            defaultValue=""
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">None</option>
            {collectionOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tags" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            placeholder="nextjs, react"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pending ? 'Saving...' : 'Save bookmark'}
        </button>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          Cancel
        </Link>
      </div>
    </form>
  )
}