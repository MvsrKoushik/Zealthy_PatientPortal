// =============================================================
// FILE: src/app/api/auth/login/route.ts
// ROUTE: POST /api/auth/login
// =============================================================
// RECEIVES: { email: string, password: string }
// RETURNS:  { user: { id, name, email } } + sets auth cookie
//
// SECURITY MEASURES IN THIS FILE:
// 1. bcrypt.compare() is timing-safe (prevents timing attacks)
// 2. SAME error message for wrong email AND wrong password
//    (prevents attackers from discovering which emails exist)
// 3. Cookie is httpOnly (JavaScript can't read it = prevents XSS)
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {try {
    // ── 1. Parse the JSON body from the request ─────────
    const { email, password } = await request.json();

    // ── 2. Validate that both fields exist ──────────────
    if (!email || !password) {
        return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400 }  // 400 = Bad Request (client sent invalid data)
        );
    }

    // ── 3. Look up the user by email ────────────────────
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
      // User doesn't exist — but we say "invalid email OR password"
      // to avoid revealing whether the email exists in our system
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }  // 401 = Unauthorized
      );
    }

    // ── 4. Compare the provided password with the stored hash ─
    // bcrypt.compare() internally hashes the attempt the same way
    // and checks if the result matches the stored hash
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },  // Same message as above!
        { status: 401 }
      );
    }

    // ── 5. SUCCESS! Create a JWT token ──────────────────
    const token = await createToken(user.id);

    // Build response — include user info but NEVER the password
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });

    // ── 6. Set the JWT as an HTTP-only cookie ───────────
    response.cookies.set('auth-token', token, {
      httpOnly: true,                                   // JavaScript can't read this cookie
      secure: process.env.NODE_ENV === 'production',    // HTTPS only in production
      sameSite: 'lax',                                  // Prevents CSRF attacks
      maxAge: 60 * 60 * 24,                             // 24 hours (in seconds)
      path: '/',                                         // Cookie available on all routes
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}