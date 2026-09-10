// Route-level loading UI — same convention as app/loading.tsx, scoped to the
// /bookmarks/[id] segment.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
    </div>
  )
}