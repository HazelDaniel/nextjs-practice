import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/app/generated/prisma/client'

// Higher-level concept: the difference-in-environments gotcha.
// Next.js dev hot-reloads re-import this module repeatedly; caching the client
// on globalThis guarantees ONE DB connection pool across reloads instead of
// exhausting SQLite handles.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  // Prisma 7 REQUIRES a driver adapter; SQLite connects via better-sqlite3.
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma