// =============================================================
// FILE: src/app/api/patients/[id]/prescriptions/[prescriptionId]/route.ts
// ROUTES: PUT    → Update a prescription
//         DELETE → Delete a prescription
// =============================================================
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> }
) {
  try {
    const { id, prescriptionId } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.medication !== undefined) data.medication = body.medication;
    if (body.dosage !== undefined) data.dosage = body.dosage;
    if (body.quantity !== undefined) data.quantity = parseInt(body.quantity);
    if (body.refillOn !== undefined) data.refillOn = new Date(body.refillOn);
    if (body.refillSchedule !== undefined) data.refillSchedule = body.refillSchedule;
    const prescription = await prisma.prescription.update({
      where: {
        id: parseInt(prescriptionId),
        userId: parseInt(id),
      },
      data,
    });
    return NextResponse.json(prescription);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> }
) {
  try {
    const { id, prescriptionId } = await params;
    await prisma.prescription.delete({
      where: {
        id: parseInt(prescriptionId),
        userId: parseInt(id),
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}