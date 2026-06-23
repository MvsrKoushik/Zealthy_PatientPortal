// =============================================================
// FILE: src/app/api/patients/route.ts
// ROUTES: GET /api/patients   → List all patients
//         POST /api/patients  → Create a new patient
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// ─── GET: List all patients ─────────────────────────────
// The admin table calls this to show the patient list.
export async function GET() {
  try {
    const patients = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // _count gives us "HOW MANY appointments/prescriptions?"
        // without fetching all the records themselves.
        // This is much faster than loading everything.
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
          },
        },
      },
      orderBy: { name: 'asc' },  // Alphabetical order
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST: Create a new patient ─────────────────────────
// The admin "New Patient" form calls this.
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'A patient with this email already exists' },
        { status: 409 }  // 409 = Conflict
      );
    }

    // Hash the password before storing (NEVER store plain text!)
    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json(patient, { status: 201 });  // 201 = Created
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}