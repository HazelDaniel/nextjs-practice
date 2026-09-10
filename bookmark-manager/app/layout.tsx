import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { getCurrentUser } from "@/lib/data";
import { signOut } from "@/lib/actions";
import "./globals.css";

// next/font: bundles Google fonts AT BUILD TIME — self-hosted, so the browser
// makes no external request and there is no layout shift from late font loads.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Higher-level concept: SEO metadata.
// `template` lets child routes supply just a title suffix — generateMetadata
// in app/bookmarks/[id] renders e.g. "Next.js Docs | Linkify".
export const metadata: Metadata = {
  title: {
    default: "Linkify — Bookmark Manager",
    template: "%s | Linkify",
  },
  description: "A full-stack bookmark manager built to learn Next.js.",
};

// Root Layout → the persistent UI shell. Layouts wrap every nested route and
// survive client-side navigation WITHOUT re-mounting (only {children} swaps).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
            {/* Higher-level concept: client-side navigation + prefetching.
                <Link> transitions WITHOUT a full page reload, and — with
                partialPrefetching enabled — prefetches the target route's App
                Shell in the background for near-instant navigation. */}
            <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Linkify
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Bookmarks
              </Link>
              <Link
                href="/new"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                + New
              </Link>
              {/* Session-dependent header content is a STREAMED CHUNK, not part
                  of the static shell: the <Suspense> boundary keeps the shell
                  prerenderable (build-time) while UserNav reads cookies
                  per-request. Same PPR pattern as the Suspense boundaries in
                  app/page.tsx. */}
              <Suspense fallback={null}>
                <UserNav />
              </Suspense>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

async function UserNav() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Sign in
      </Link>
    )
  }

  return (
    <>
      <span className="hidden text-zinc-500 sm:inline dark:text-zinc-400">
        {user.name ?? user.email}
      </span>
      {/* A Server Action used as a form action: posts on submit, server runs
          destroySession + redirects — same pattern as the bookmark card's
          archive form. */}
      <form action={signOut}>
        <button className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          Sign out
        </button>
      </form>
    </>
  )
}