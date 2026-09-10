import { Suspense } from 'react'
import NewBookmarkForm from '@/components/new-bookmark-form'
import { getCollections, getCurrentUser } from '@/lib/data'

// Static (per-route) metadata — same concept as the Metadata in app/layout.tsx
// (the layout's `template` appends " | Linkify" here).
export const metadata = {
  title: 'New bookmark',
}

export default function NewBookmarkPage() {
  // Collections are fetched as an UNRESOLVED promise and passed straight to
  // the Client Component, which resolves them with React's use() inside its
  // <Suspense> parent — see new-bookmark-form.tsx.
  const userPromise = getCurrentUser().then((u) => u?.id)
  const collectionsPromise = userPromise.then((userId) =>
    userId ? getCollections(userId) : [],
  )

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Add a bookmark
      </h1>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        }
      >
        <NewBookmarkForm collections={collectionsPromise} />
      </Suspense>
    </div>
  )
}