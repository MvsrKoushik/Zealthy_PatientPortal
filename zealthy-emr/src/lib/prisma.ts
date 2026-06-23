// =============================================================
// FILE: src/lib/prisma.ts
// =============================================================
// PURPOSE: Creates a SINGLE shared database connection.
//
// WHY A SINGLETON?
// In development, Next.js "hot reloads" on every file save.
// Each reload would create a NEW database connection without
// this pattern. Eventually you'd run out of connections and crash.
//
// SOLUTION: Store ONE client on the global object. On hot reload,
// reuse the existing connection instead of creating a new one.
// =============================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.POSTGRES_PRISMA_URL 
  || process.env.DATABASE_URL 
  || 'postgresql://neondb_owner:npg_wFNH5DdBYu1E@ep-restless-frog-at56r6n8-pooler.c-9.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require';

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;