// =============================================================
// FILE: src/lib/auth.ts
// =============================================================
// PURPOSE: Utility functions for JWT token management.
//
// THREE FUNCTIONS:
// 1. createToken(userId)   → Makes a signed JWT after login
// 2. verifyToken(token)    → Checks if a JWT is valid
// 3. getCurrentUser()      → Reads the cookie and returns the user ID
//
// WHY "jose" INSTEAD OF "jsonwebtoken"?
// jose works with Next.js Edge Runtime (faster) and is the
// modern standard for JWT in JavaScript/TypeScript.
// =============================================================

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Convert our secret string into bytes (Uint8Array format)
// This secret MUST be kept private — anyone with it can forge tokens!
const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'zealthy-emr-secret-key'
);

/**
 * Creates a signed JWT token for a user.
 * Called after a successful login.
 *
 * @param userId - The database ID of the authenticated user
 * @returns A signed JWT string like "eyJhbGciOiJIUzI1NiJ9..."
 */
export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ userId })             // Payload: data stored in the token
    .setProtectedHeader({ alg: 'HS256' })    // Algorithm: HMAC with SHA-256
    .setExpirationTime('24h')                // Token auto-expires after 24 hours
    .sign(secret);                            // Sign with our secret key
}

/**
 * Verifies a JWT token and returns the embedded data.
 *
 * @param token - The JWT string to verify
 * @returns { userId } if valid, or null if invalid/expired/tampered
 */
export async function verifyToken(
    token: string
): Promise<{ userId: number } | null> {
    try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as number };
} catch {
    // Token is invalid, expired, or tampered with
    return null;
}
}

/**
 * Reads the auth cookie and returns the logged-in user's ID.
 * This is the main helper used by API routes to answer:
 * "Who is making this request?"
 *
 * @returns The user's database ID, or null if not logged in
 */
export async function getCurrentUser(): Promise<number | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;  // No cookie = not logged in
const payload = await verifyToken(token);
return payload?.userId ?? null;
}