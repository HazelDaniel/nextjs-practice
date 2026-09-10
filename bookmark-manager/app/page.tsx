import { Suspense } from 'react'
import Search from '@/components/search'
import Sidebar from '@/components/sidebar'
import SidebarSkeleton from '@/components/sidebar-skeleton'
import BookmarkList from '@/components/bookmark-list'
import BookmarkListSkeleton from '@/components/bookmark-list-skeleton'

// Higher-level concept: Partial Prerendering — keep the shell static.
// This page intentionally does NOT await searchParams or fetch data. By
// staying synchronous it preserves a prerendered HTML shell; the dynamic work
// moves DOWN into <Suspense> boundaries (here: sidebar + list), where the
// fallback skeleton ships inside the shell and content streams at request time.
export default function Home({
  searchParams,
}: {
  // searchParams is a PROMISE in Next 16. It is passed down untouched and
  // awaited inside the Suspense boundary so this route stays prerenderable.
  searchParams: Promise<{ q?: string; collection?: string }>
}) {
  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-8 md:grid-cols-[auto_1fr]">
      {/* Each <Suspense> = one independently streamed chunk of the page. */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <main className="min-w-0">
        <div className="mb-6">
          {/* Server Components can render Client Components (interactive UI) —
              the client bundle stays scoped to that subtree. See search.tsx. */}
          <Search />
        </div>
        <Suspense fallback={<BookmarkListSkeleton />}>
          <BookmarkList searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}