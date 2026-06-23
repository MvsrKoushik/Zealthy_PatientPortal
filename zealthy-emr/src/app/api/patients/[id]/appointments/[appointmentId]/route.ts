// =============================================================
// FILE: src/app/api/patients/[id]/appointments/[appointmentId]/route.ts
// ROUTES: PUT    → Update an appointment
//         DELETE → Delete an appointment
//
// WHY TWO DYNAMIC SEGMENTS? ([id] and [appointmentId])
// We check BOTH to ensure the appointment belongs to this patient.
// This is a security measure — without it, someone could update
// another patient's appointment by guessing the appointment ID.
// =============================================================
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appointmentId: string }> }
) {
  try {
    const { id, appointmentId } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.provider !== undefined) data.provider = body.provider;
    if (body.datetime !== undefined) data.datetime = new Date(body.datetime);
    if (body.repeat !== undefined) data.repeat = body.repeat;
    if (body.endDate !== undefined) {
      data.endDate = body.endDate ? new Date(body.endDate) : null;
    }
    const appointment = await prisma.appointment.update({
      where: {
        id: parseInt(appointmentId),
        userId: parseInt(id),
      },
      data,
    });
    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; appointmentId: string }> }
) {
  try {
    const { id, appointmentId } = await params;
    await prisma.appointment.delete({
      where: {
        id: parseInt(appointmentId),
        userId: parseInt(id),
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}