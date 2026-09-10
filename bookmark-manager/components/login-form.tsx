'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type ActionState } from '@/lib/actions'

// Higher-level concept: same Server Action hook pattern as
// new-bookmark-form.tsx (useActionState feeding an action's (prevState, formData)).
// This form posts server-side on submit; the hidden 'next' field lets the login
// action return you to the page the proxy interrupted with a redirect.
export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {})

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Email</span>
        <input
          name="email"
          type="email"
          required
          autoFocus
          placeholder="demo@example.com"
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Password</span>
        <input
          name="password"
          type="password"
          required
          placeholder="password123"
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {state.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-3 py-2 font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-xs text-zinc-500">
        Demo credentials: <code>demo@example.com</code> /{' '}
        <code>password123</code>
      </p>
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back to app
      </Link>
    </form>
  )
}