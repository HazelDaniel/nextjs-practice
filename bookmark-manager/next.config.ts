import type { NextConfig } from "next";

// Higher-level concept: Cache Components & Partial Prerendering (PPR).
// cacheComponents switches Next.js to the new caching model: at build time it
// prerenders a static HTML shell per route, then STREAMS dynamic content in.
// Opt-in data caching is then expressed with `use cache` (see collections page).
const nextConfig: NextConfig = {
  cacheComponents: true,

  // Pairing concept: Partial Prefetching (see <Link> in app/layout.tsx).
  // Every <Link> prefetches the target route's App Shell — static markup +
  // Suspense/loading fallbacks + session data — so client-side navigation is
  // instant even when the destination's data streams afterwards.
  partialPrefetching: true,
};

export default nextConfig;
