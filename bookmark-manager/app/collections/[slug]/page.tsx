import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import BookmarkList from '@/components/bookmark-list'
import BookmarkListSkeleton from '@/components/bookmark-list-skeleton'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/data'
import { cacheLife, cacheTag } from 'next/cache'

async function CollectionHeader({ slug }: { slug: string }) {
  // Higher-level concept: Cache Components — the data/UI caching layer that
  // `cacheComponents` in next.config.ts enables.
  //   'use cache: private'  caches this component's output keyed to the current
  //                         request context (params/cookies are part of it) and
  //                         stores the result ONLY in the client/browser cache —
  //                         right for per-user data, never shared across users.
  //   cacheLife(stale)      the freshness window: within `stale` seconds the
  //                         cached result is served without re-executing.
  //   cacheTag(name)        names the entry so revalidateTag('collections') can
  //                         invalidate it explicitly from a mutation.
  "use cache: private";
  cacheLife({stale: 180});
  cacheTag("collections");

  const user = await getCurrentUser()
  const collection = user
    ? await prisma.collection.findFirst({ where: { slug, userId: user.id } })
    : null
  if (!collection) notFound()

  return (
    <header className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Collection
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {collection.name}
      </h1>
    </header>
  )
}

// Same shell-preserving pattern as app/page.tsx: params (a Promise) is awaited
// HERE, inside the Suspense boundary, so only this chunk becomes dynamic while
// the page shell stays prerendered.
async function PageBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <>
      <CollectionHeader slug={slug} />
      <BookmarkList searchParams={Promise.resolve({})} collectionSlug={slug} />
    </>
  )
}

export default function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <Suspense
        fallback={
          <>
            <div className="mb-6 h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <BookmarkListSkeleton />
          </>
        }
      >
        <PageBody params={params} />
      </Suspense>
    </div>
  )
}