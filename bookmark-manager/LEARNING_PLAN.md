# Bookmark Manager — Next.js Learning Plan

> Learning Next.js by doing. This file is our concept checklist / progress tracker.
> Each concept is taught through hands-on work in this app. Check items off as we complete them.

## App

A full-stack **Link / Bookmark Manager** built with:
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Prisma 7 + SQLite

## Concepts & Progress

### 1. Scaffolding & Project Setup
- [x] `create-next-app` (TypeScript, Tailwind, ESLint, App Router)
- [x] Prisma + SQLite setup, config, client generation

### 2. Routing (App Router)
- [x] File-based routing (`/`, nested folders)
- [x] Dynamic routes (`/[id]`, `/collections/[slug]`)
- [x] Layouts (nested, root layout)
- [x] Navigation (`Link`, `useRouter`)
- [x] `not-found` and error boundaries
- [ ] Route Groups / parallel routes

### 3. Data Fetching
- [x] Server Components fetching from DB (async)
- [x] `loading.tsx` (Suspense / loading UI)
- [x] `error.tsx` (error boundaries)
- [x] Static vs Dynamic rendering (Partial Prerendering — see notes)
- [x] `revalidatePath` / revalidation
- [x] Streaming data Server -> Client with React's `use()` API
- [x] Search params (`/ ?q=` filtering), evaluated inside `<Suspense>`

### 4. Components & Data Mutations
- [x] Server Components (default)
- [x] Client Components (`"use client"`)
- [x] Passing data Server -> Client (props + `use()`)
- [x] Server Actions (form mutations: create/update/delete)
- [x] Form validation (Zod 4)
- [x] Pending states (`useActionState`)
- [ ] Optimistic updates
- [x] Server Function invoked from event handler / `useEffect` (click counter)

### 5. Route Handlers (API)
- [x] `route.ts` GET/POST/PATCH/DELETE
- [x] Search params handling in Route Handlers
- [x] API vs Server Actions trade-offs (API needs manual `revalidatePath`)

### 6. Proxy & Auth (was: Middleware & Auth)
- [x] `proxy.ts` (Middleware renamed to Proxy in Next 16)
- [x] Authentication (sessions / cookies)
- [x] Password hashing (scrypt via `node:crypto`)

### 7. Advanced Topics
- [x] Cache Components (`use cache`, `cacheLife`, `cacheTag`) — collections page
- [ ] Image optimization (`next/image`)
- [x] Metadata & SEO (`generateMetadata`, template)
- [x] Environment variables / config (`DATABASE_URL`, `SESSION_SECRET`)
- [ ] Production build & deployment notes

## Notes / Learnings
- **Prisma 7 is driver-adapter based**: `new PrismaClient({ adapter })` is required; SQLite uses `@prisma/adapter-better-sqlite3`. The client is generated as TypeScript (not the legacy `prisma-client-js` JS output) into `app/generated/prisma`. Config lives in `prisma7.config.ts`.
- **Next 16 renames Middleware → Proxy** (`proxy.ts`, `proxy()` function).
- **Cache Components are opt-in** via `cacheComponents: true` in `next.config.ts`. They turn on Partial Prerendering (PPR) by default: pages build a static HTML shell + stream dynamic content.
- **Runtime APIs / uncached data must be read inside `<Suspense>`** (or cached with `use cache` / `use cache: private`), otherwise Next surfaces a `blocking-prerender` insight.
- **`params` and `searchParams` are Promises** — must be awaited.
- **`runtime = 'nodejs'` is now forbidden** with Cache Components (Node is the only runtime; the export is removed).
- **`cookies()` and `headers()` must be awaited.**
- **`refresh()`** from `next/cache` refreshes the client router (does not revalidate tagged data); **`revalidatePath`/`revalidateTag`** revalidate the data cache.
- **Route Handlers**: GET/POST return plain `Response.json(...)`; `use cache` cannot be used directly inside a handler body — extract to a helper.
- **Proxy is a coarse, STATELESS gate — never a security boundary.** `proxy.ts` (Next 16's rename of `middleware`) checks a signed cookie (HMAC + TTL) with no DB access, then redirects `/api/*` → 401 JSON vs pages → `/login?next=...`. The AUTHORITATIVE check is `getSessionUser()` (cookie → DB row lookup) inside every Server Action / handler / page. Deleting the session row revokes the cookie.
- **Signed cookies without dependencies**: `lib/session.ts` uses `node:crypto` HMAC (`token.expiresAt` + signature); `lib/password.ts` uses `scryptSync` + per-user salt + `timingSafeEqual`. Never store plaintext passwords.
- **Identity data must NOT live in the static shell.** An async root layout calling `cookies()` broke prerendering of `/_not-found` and would force every page dynamic → the fix was a `<Suspense>` boundary (`<UserNav />`) inside the layout so user-specific header content streams per-request while the shell stays prerendered.
- **`/login` reading `searchParams` (the `next` redirect target) hit the same `blocking-prerender` fix**: await it inside a Suspense boundary, exactly like the collections page.
- **React 19 server-action forms post via the `$ACTION_REF`/`$ACTION_KEY` protocol** — not reproducible by curl; verify login flow in a browser.
- Demo login: `demo@example.com` / `password123` (seed hashes it).
