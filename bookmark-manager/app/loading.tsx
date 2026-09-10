// Higher-level concept: the loading.tsx file convention — route-level
// streaming/PPR fallback. Next.js wraps each page in <Suspense> and ships THIS
// markup inside the static (and prefetched) App Shell; it shows instantly on
// navigation and is replaced when the route's data renders. Finer-grained
// variant: the inline <Suspense> boundaries in app/page.tsx.
import BookmarkListSkeleton from "@/components/bookmark-list-skeleton";
import SidebarSkeleton from "@/components/sidebar-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-8 md:grid-cols-[auto_1fr]">
      <SidebarSkeleton />
      <main className="min-w-0 space-y-6">
        <div className="h-9 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <BookmarkListSkeleton />
      </main>
    </div>
  );
}