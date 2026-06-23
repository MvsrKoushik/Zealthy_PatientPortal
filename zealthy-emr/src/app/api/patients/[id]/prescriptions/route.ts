// =============================================================
// FILE: src/app/api/patients/[id]/prescriptions/route.ts
// ROUTES: GET  → List all prescriptions for this patient
//         POST → Create a new prescription
// =============================================================
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prescriptions = await prisma.prescription.findMany({
      where: { userId: parseInt(id) },
      orderBy: { refillOn: 'asc' },
    });
    return NextResponse.json(prescriptions);
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
    const { medication, dosage, quantity, refillOn, refillSchedule } =
      await request.json();
    if (!medication || !dosage || !quantity || !refillOn || !refillSchedule) {
      return NextResponse.json(
        { error: 'All prescription fields are required' },
        { status: 400 }
      );
    }
    const prescription = await prisma.prescription.create({
      data: {
        medication,
        dosage,
        quantity: parseInt(quantity),
        refillOn: new Date(refillOn),
        refillSchedule,
        userId: parseInt(id),
      },
    });
    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}