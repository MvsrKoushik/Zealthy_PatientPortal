// =============================================================
// FILE: src/app/api/medications/route.ts
// ROUTE: GET /api/medications
// =============================================================
// PURPOSE: Returns the list of available medications and dosages.
// The admin prescription form uses this to populate dropdowns.
//
// WHY FROM THE DATABASE?
// Instead of hardcoding options in the frontend, we fetch from
// the database. If new medications are added, the form
// automatically shows them — no code change needed.
// =============================================================
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [medications, dosages] = await Promise.all([
      prisma.medication.findMany({ orderBy: { name: 'asc' } }),
      prisma.dosage.findMany({ orderBy: { id: 'asc' } }),
    ]);
    return NextResponse.json({
      medications: medications.map((m) => m.name),
      dosages: dosages.map((d) => d.value),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}