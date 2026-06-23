// =============================================================
// FILE: prisma/seed.ts
// =============================================================
// PURPOSE: Populates the database with the sample data from the
// Zealthy exercise requirements.
//
// HOW TO RUN:  npx tsx prisma/seed.ts
//
// WHY A SEED SCRIPT?
// 1. The exercise REQUIRES using their sample JSON data
// 2. Anyone cloning the repo can get started immediately
// 3. You can reset to a known state anytime by re-running it
// =============================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Create a new database connection
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── STEP 1: Clear existing data ───────────────────────
  // WHY: So we can run this script multiple times without duplicates.
  // WHY THIS ORDER: Delete CHILD tables first (appointments,
  // prescriptions) before PARENT tables (users) because of
  // foreign key constraints. A child row can't exist without its parent.
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.dosage.deleteMany();
  console.log('  ✓ Cleared existing data');

  // ─── STEP 2: Seed Medications (from exercise data.json) ─
  // These are the ONLY medications that can be prescribed.
  const medications = [
    'Diovan', 'Lexapro', 'Metformin', 'Ozempic',
    'Prozac', 'Seroquel', 'Tegretol',
  ];
  for (const name of medications) {
    await prisma.medication.create({ data: { name } });
  }
  console.log('  ✓ Seeded', medications.length, 'medications');

  // ─── STEP 3: Seed Dosages (from exercise data.json) ─────
  const dosages = [
    '1mg', '2mg', '3mg', '5mg', '10mg', '25mg',
    '50mg', '100mg', '250mg', '500mg', '1000mg',
  ];
  for (const value of dosages) {
    await prisma.dosage.create({ data: { value } });
  }
  console.log('  ✓ Seeded', dosages.length, 'dosages');

  // ─── STEP 4: Hash the password ─────────────────────────
  // SECURITY CONCEPT: We NEVER store passwords as plain text!
  //
  // bcrypt.hash("Password123!", 10) converts it into something like:
  //   "$2a$10$X7Qd4Jx8K5mN2pR..."
  //
  // This is a ONE-WAY transformation — you CANNOT reverse it.
  // To check a login, you hash the attempt and compare the two hashes.
  //
  // The number 10 is "salt rounds" — higher = more secure but slower.
  // 10 is a good default for most applications.
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // ─── STEP 5: Create Patient 1 — Mark Johnson ───────────
  const mark = await prisma.user.create({
    data: {
      name: 'Mark Johnson',
      email: 'mark@some-email-provider.net',
      password: hashedPassword,
    },
  });
  console.log('  ✓ Created user: Mark Johnson (id:', mark.id, ')');

  // Mark's appointments (from exercise seed data)
  await prisma.appointment.createMany({
    data: [
      {
        provider: 'Dr Kim West',
        datetime: new Date('2026-04-16T16:30:00.000-07:00'),
        repeat: 'weekly',
        userId: mark.id,
      },
      {
        provider: 'Dr Lin James',
        datetime: new Date('2026-04-19T18:30:00.000-07:00'),
        repeat: 'monthly',
        userId: mark.id,
      },
    ],
  });

  // Mark's prescriptions
  await prisma.prescription.createMany({
    data: [
      {
        medication: 'Lexapro',
        dosage: '5mg',
        quantity: 2,
        refillOn: new Date('2026-04-05'),
        refillSchedule: 'monthly',
        userId: mark.id,
      },
      {
        medication: 'Ozempic',
        dosage: '1mg',
        quantity: 1,
        refillOn: new Date('2026-04-10'),
        refillSchedule: 'monthly',
        userId: mark.id,
      },
    ],
  });

  // ─── STEP 6: Create Patient 2 — Lisa Smith ─────────────
  const lisa = await prisma.user.create({
    data: {
      name: 'Lisa Smith',
      email: 'lisa@some-email-provider.net',
      password: hashedPassword,
    },
  });
  console.log('  ✓ Created user: Lisa Smith (id:', lisa.id, ')');

  await prisma.appointment.createMany({
    data: [
      {
        provider: 'Dr Sally Field',
        datetime: new Date('2026-04-22T18:15:00.000-07:00'),
        repeat: 'monthly',
        userId: lisa.id,
      },
      {
        provider: 'Dr Lin James',
        datetime: new Date('2026-04-25T20:00:00.000-07:00'),
        repeat: 'weekly',
        userId: lisa.id,
      },
    ],
  });

  await prisma.prescription.createMany({
    data: [
      {
        medication: 'Metformin',
        dosage: '500mg',
        quantity: 2,
        refillOn: new Date('2026-04-15'),
        refillSchedule: 'monthly',
        userId: lisa.id,
      },
      {
        medication: 'Diovan',
        dosage: '100mg',
        quantity: 1,
        refillOn: new Date('2026-04-25'),
        refillSchedule: 'monthly',
        userId: lisa.id,
      },
    ],
  });

  console.log('🎉 Database seeded successfully!');
}

// Run the seed function, then disconnect
main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });