// Higher-level concept: route-level Error Boundary — and why it must be a
// Client Component: the boundary catches errors on the CLIENT (and during
// hydration), so it needs interactivity. Renders when a Server Component in
// this segment throws; reset() re-renders the segment to recover.
"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h2>
      <p className="mt-1 text-sm text-zinc-500">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Try again
      </button>
    </div>
  );
}