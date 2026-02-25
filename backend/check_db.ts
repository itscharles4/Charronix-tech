import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- DATABASE STATUS REPORT ---');
    const counts = {
        Users: await prisma.user.count(),
        Students: await prisma.student.count(),
        Teachers: await prisma.teacher.count(),
        Attendance: await prisma.attendance.count(),
        AcademicGrades: await prisma.academicGrade.count(),
        Notices: await prisma.notice.count(),
        TimetableEntries: await prisma.timetable.count(),
    };
    console.log(JSON.stringify(counts, null, 2));
    console.log('------------------------------');
}
main().catch(console.error).finally(() => prisma.$disconnect());
