// =============================================================
// FILE: src/app/api/auth/me/route.ts
// ROUTE: GET /api/auth/me
// =============================================================
// PURPOSE: Returns the currently logged-in user's info.
// The frontend calls this on page load to check:
// "Is this person still logged in? If so, who are they?"
// =============================================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    // getCurrentUser() reads the cookie → verifies JWT → returns userId
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user but explicitly EXCLUDE the password
    // "select" means "ONLY return these specific fields"
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}