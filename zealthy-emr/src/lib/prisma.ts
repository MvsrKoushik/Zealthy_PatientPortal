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

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;