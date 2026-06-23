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
import fs from 'fs';
import path from 'path';

function getDbPath() {
  // On Vercel, copy the database to /tmp (writable directory)
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/dev.db';
    if (!fs.existsSync(tmpDb)) {
      // Try to copy from the build output
      const sourceDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDb);
      }
    }
    return `file:${tmpDb}`;
  }
  return process.env.DATABASE_URL || 'file:./dev.db';
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDbPath(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;