// =============================================================
// FILE: src/app/api/auth/logout/route.ts
// ROUTE: POST /api/auth/logout
// =============================================================
// PURPOSE: Logs the user out by deleting the auth cookie.
//
// WHY POST INSTEAD OF GET?
// Logout CHANGES STATE (removes the session). HTTP best practice
// says GET should only READ data. POST/PUT/DELETE are for changes.
// =============================================================

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Setting maxAge to 0 tells the browser: "delete this cookie NOW"
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,    // ← THIS is what deletes the cookie
    path: '/',
  });

  return response;
}