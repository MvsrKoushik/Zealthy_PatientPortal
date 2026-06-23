// =============================================================
// FILE: src/app/api/patients/[id]/route.ts
// ROUTES: GET /api/patients/:id  → Get one patient with all data
//         PUT /api/patients/:id  → Update patient info
//
// [id] in the folder name = DYNAMIC ROUTE PARAMETER
// Next.js captures it from the URL automatically.
// Example: /api/patients/42 → params.id = "42"
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true, name: true, email: true, createdAt: true,
        appointments: { orderBy: { datetime: 'asc' } },
        prescriptions: { orderBy: { refillOn: 'asc' } },
      },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, email, password } = await request.json();
    const data: Record<string, string> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);
    const patient = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json(patient);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}