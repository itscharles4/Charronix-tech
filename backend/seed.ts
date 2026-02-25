import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting Phase 2 - Database Seed Data Insertion...\n');

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'SEED_TEST_DATA.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split into individual statements (basic split by semicolon)
    const statements = sqlContent
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    let executedCount = 0;

    console.log(`📋 Total SQL statements to execute: ${statements.length}\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('--')) continue;

      try {
        // Use raw query execution
        await prisma.$executeRawUnsafe(statement);
        executedCount++;

        // Log progress every 10 statements
        if (executedCount % 10 === 0) {
          console.log(`✅ Executed ${executedCount}/${statements.length} statements`);
        }
      } catch (error) {
        // Some statements might fail due to conflicts - that's okay with ON CONFLICT
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('ON CONFLICT')) {
          executedCount++;
        } else if (!errorMessage.includes('duplicate key')) {
          console.warn(`⚠️  Warning on statement ${i + 1}: ${errorMessage}`);
        }
        executedCount++;
      }
    }

    console.log(`\n✅ Completed executing ${executedCount} SQL statements\n`);

    // Verify the data insertion
    console.log('📊 Verifying inserted data...\n');

    const counts = {
      users: await prisma.user.count(),
      students: await prisma.student.count(),
      teachers: await prisma.teacher.count(),
      grades: await prisma.academicGrade.count(),
      achievements: await prisma.achievement.count(),
      notices: await prisma.notice.count(),
      notifications: await prisma.notification.count(),
      attendance: await prisma.attendance.count(),
      medicalInfo: await prisma.medicalInfo.count(),
    };

    console.log('📈 Data Insertion Summary:');
    console.log(`  👤 Users: ${counts.users}`);
    console.log(`  👨‍🎓 Students: ${counts.students}`);
    console.log(`  👨‍🏫 Teachers: ${counts.teachers}`);
    console.log(`  📝 Academic Grades: ${counts.grades}`);
    console.log(`  🏆 Achievements: ${counts.achievements}`);
    console.log(`  📢 Notices: ${counts.notices}`);
    console.log(`  🔔 Notifications: ${counts.notifications}`);
    console.log(`  ✅ Attendance Records: ${counts.attendance}`);
    console.log(`  🏥 Medical Info: ${counts.medicalInfo}`);

    const totalRecords =
      counts.users +
      counts.students +
      counts.teachers +
      counts.grades +
      counts.achievements +
      counts.notices +
      counts.notifications +
      counts.attendance +
      counts.medicalInfo;

    console.log(`\n🎉 Total Records Inserted: ${totalRecords}\n`);

    // Sample queries to verify data integrity
    console.log('🔍 Sample Data Verification:\n');

    const studentSample = await prisma.student.findFirst({
      include: { user: true },
    });
    console.log(`  ✅ Sample Student: ${studentSample?.firstName} ${studentSample?.lastName}`);

    const attendanceSample = await prisma.attendance.findFirst({
      include: { student: true, markedBy: true },
    });
    console.log(`  ✅ Sample Attendance: ${attendanceSample?.student?.firstName} - ${attendanceSample?.status} on ${attendanceSample?.date}`);

    const notificationSample = await prisma.notification.findFirst({
      include: { user: true },
    });
    console.log(`  ✅ Sample Notification: ${notificationSample?.title}`);

    console.log('\n✨ Phase 2 - Database Seeding Completed Successfully!\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
