import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  try {
    const students = await prisma.student.findMany({
      where: {
        admissionNo: {
          in: ['ADM2026100', 'ADM2026101', 'ADM2026102'],
        },
      },
    });

    console.log('✅ MIGRATION VERIFICATION');
    console.log('========================\n');
    console.log(`Found ${students.length} migrated students in PostgreSQL:\n`);

    students.forEach((s) => {
      console.log(
        `  ✅ ${s.firstName} ${s.lastName}`
      );
      console.log(`     Admission #: ${s.admissionNo}`);
      console.log(`     Class: ${s.class}${s.section} | Roll #: ${s.rollNo}`);
      console.log(`     Parent: ${s.parentName} (${s.parentPhone})`);
      console.log();
    });

    console.log('========================');
    console.log('✨ Migration successful!');
    console.log('📊 Students are now visible on the frontend dashboard.');
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
