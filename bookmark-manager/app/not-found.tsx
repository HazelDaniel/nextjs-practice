// Higher-level concept: the not-found file convention. Rendered when
// notFound() is called from a route (see app/bookmarks/[id]/page.tsx), or when
// no route matches the requested URL.
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl font-bold text-zinc-300 dark:text-zinc-700">404</p>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Page not found
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Go home
      </Link>
    </div>
  );
}