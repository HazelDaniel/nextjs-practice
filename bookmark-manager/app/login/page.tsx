import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/components/login-form'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Sign in to Linkify
      </h1>
      {/* Same fix as the collections page: searchParams is a runtime value, so
          it must be awaited INSIDE this Suspense boundary instead of in the
          page body (otherwise /login can't be prerendered). */}
      <Suspense fallback={null}>
        <LoginPanel searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function LoginPanel({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  // `next` is appended by proxy.ts when it interrupts an unauthenticated
  // request (e.g. ?next=/bookmarks/xyz). Search params are awaited like
  // params — a Next 16 Promise.
  const { next } = await searchParams
  return <LoginForm next={next ?? '/'} />
}