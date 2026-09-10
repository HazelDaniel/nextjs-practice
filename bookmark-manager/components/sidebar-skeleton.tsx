export default function SidebarSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-8 md:w-56">
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-5 w-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  )
}