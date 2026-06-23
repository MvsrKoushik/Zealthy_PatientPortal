// =============================================================
// FILE: src/app/api/patients/[id]/appointments/route.ts
// ROUTES: GET  → List all appointments for this patient
//         POST → Create a new appointment for this patient
// =============================================================
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointments = await prisma.appointment.findMany({
      where: { userId: parseInt(id) },
      orderBy: { datetime: 'asc' },
    });
    return NextResponse.json(appointments);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { provider, datetime, repeat } = await request.json();
    if (!provider || !datetime) {
      return NextResponse.json(
        { error: 'Provider and datetime are required' },
        { status: 400 }
      );
    }
    const appointment = await prisma.appointment.create({
      data: {
        provider,
        datetime: new Date(datetime),
        repeat: repeat || 'none',
        userId: parseInt(id),
      },
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}