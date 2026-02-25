import { PrismaClient, AttendanceStatus, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate attendance records
function generateAttendanceRecords(
  studentId: string,
  year: number,
  month: number,
  markedById: string
): Array<{studentId: string; date: Date; status: AttendanceStatus; remarks: string | null; markedById: string}> {
  const records: Array<{studentId: string; date: Date; status: AttendanceStatus; remarks: string | null; markedById: string}> = [];
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  // Working days: Monday to Friday
  const workingDays = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) { // Skip Sunday (0) and Saturday (6)
      workingDays.push(new Date(d));
    }
  }
  
  // Randomly assign attendance statuses
  const statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'];
  
  workingDays.forEach((date) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    records.push({
      studentId,
      date: new Date(date),
      status: randomStatus,
      remarks: randomStatus !== 'PRESENT' ? `${randomStatus} on ${date.toDateString()}` : null,
      markedById,
    });
  });
  
  return records;
}

// Helper function to generate notifications
function generateNotifications(userId: string, count: number = 5): Array<{userId: string; title: string; message: string; type: NotificationType; isRead: boolean; createdAt: Date}> {
  const notifications: Array<{userId: string; title: string; message: string; type: NotificationType; isRead: boolean; createdAt: Date}> = [];
  const types: NotificationType[] = ['INFO', 'WARNING', 'SUCCESS', 'ERROR'];
  const titles = [
    'Attendance reminder',
    'Assignment submitted',
    'Grade published',
    'Monthly report ready',
    'Parent meeting scheduled',
    'Fee payment due',
    'Exam schedule available',
    'Holiday announcement',
  ];
  
  for (let i = 0; i < count; i++) {
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    
    notifications.push({
      userId,
      title: randomTitle,
      message: `${randomTitle} - Please check your dashboard for details.`,
      type: randomType,
      isRead: Math.random() > 0.5,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    });
  }
  
  return notifications;
}

async function seedCompleteData() {
  try {
    console.log('🌱 Starting comprehensive seeding for all students...\n');

    // Get all students
    const allStudents = await prisma.student.findMany({
      include: { user: true }
    });

    console.log(`📊 Found ${allStudents.length} students\n`);

    // Get first available teacher to mark attendance
    let markedById = '';
    const teacher = await prisma.teacher.findFirst();
    if (teacher) {
      markedById = teacher.id;
      console.log(`✅ Using teacher: ${teacher.firstName} ${teacher.lastName}\n`);
    } else {
      console.log('⚠️  No teacher found. Using first student ID as placeholder.\n');
      markedById = allStudents[0]?.id || 'system';
    }

    let attendanceCreated = 0;
    let notificationsCreated = 0;

    // For each student, create attendance records
    console.log('📅 Creating attendance records...\n');
    for (const student of allStudents) {
      const attendanceRecords = generateAttendanceRecords(student.id, 2026, 2, markedById);
      
      if (attendanceRecords.length > 0) {
        await prisma.attendance.createMany({
          data: attendanceRecords,
          skipDuplicates: true,
        });
        attendanceCreated += attendanceRecords.length;
        console.log(`✅ ${student.firstName} ${student.lastName}: ${attendanceRecords.length} records`);
      }
    }

    console.log(`\n📬 Creating notifications...\n`);

    // For each student user, create notifications
    for (const student of allStudents) {
      if (student.userId) {
        const notificationRecords = generateNotifications(student.userId, 5);
        
        if (notificationRecords.length > 0) {
          await prisma.notification.createMany({
            data: notificationRecords,
            skipDuplicates: true,
          });
          notificationsCreated += notificationRecords.length;
          console.log(`🔔 ${student.firstName} ${student.lastName}: ${notificationRecords.length} notifications`);
        }
      }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✨ SEEDING COMPLETE ✨');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📚 Total Students: ${allStudents.length}`);
    console.log(`📅 Attendance Records: ${attendanceCreated}`);
    console.log(`📬 Notifications: ${notificationsCreated}`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompleteData();
