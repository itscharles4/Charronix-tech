const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get all students with user info
    const students = await prisma.student.findMany({
      include: { user: { select: { email: true } } }
    });
    
    console.log('\n=== ALL STUDENTS ===');
    for (const student of students) {
      console.log(`${student.firstName} ${student.lastName} (ADM: ${student.admissionNo}, Email: ${student.user?.email})`);
    }
    
    // Check attendance records for February 2026
    console.log('\n=== ATTENDANCE RECORDS (Feb 2026) ===');
    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(2026, 1, 1),
          lte: new Date(2026, 1, 28)
        }
      },
      select: { studentId: true, date: true, status: true }
    });
    
    const attendanceByStudent = {};
    attendance.forEach(record => {
      if (!attendanceByStudent[record.studentId]) {
        attendanceByStudent[record.studentId] = 0;
      }
      attendanceByStudent[record.studentId]++;
    });
    
    for (const student of students) {
      const count = attendanceByStudent[student.id] || 0;
      console.log(`${student.firstName} ${student.lastName}: ${count} records`);
    }
    
    // Check notifications
    console.log('\n=== NOTIFICATIONS ===');
    const notifications = await prisma.notification.findMany({
      select: { userId: true, title: true, createdAt: true }
    });
    
    const notificationsByUser = {};
    notifications.forEach(notif => {
      if (!notificationsByUser[notif.userId]) {
        notificationsByUser[notif.userId] = 0;
      }
      notificationsByUser[notif.userId]++;
    });
    
    for (const student of students) {
      const count = notificationsByUser[student.userId] || 0;
      console.log(`${student.firstName} ${student.lastName}: ${count} notifications`);
    }
    
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
