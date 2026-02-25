
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('📊 Generating Database Report...');
    const reportPath = './db_report.txt';

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
            student: true,
            teacher: true,
        }
    });

    let report = '=== CHARRONIX DATABASE REPORT ===\n';
    report += `Generated at: ${new Date().toLocaleString()}\n\n`;

    report += `Total Users: ${users.length}\n`;
    report += `Admins: ${users.filter(u => u.role === 'ADMIN').length}\n`;
    report += `Teachers: ${users.filter(u => u.role === 'TEACHER').length}\n`;
    report += `Students: ${users.filter(u => u.role === 'STUDENT').length}\n\n`;

    report += '--- USER SAMPLES ---\n';

    // Principal
    const admin = users.find(u => u.role === 'ADMIN');
    if (admin) {
        report += `Principal: ID=${admin.loginId}, Email=${admin.email}\n`;
    }

    // Teachers sample
    report += '\nTeachers (First 5):\n';
    users.filter(u => u.role === 'TEACHER').slice(0, 5).forEach(u => {
        report += `- ${u.teacher?.firstName} ${u.teacher?.lastName}: loginId=${u.loginId}, employeeId=${u.teacher?.employeeId}, email=${u.email}\n`;
    });

    // Students sample
    report += '\nStudents (First 5):\n';
    users.filter(u => u.role === 'STUDENT').slice(0, 5).forEach(u => {
        report += `- ${u.student?.firstName} ${u.student?.lastName}: loginId=${u.loginId}, admissionNo=${u.student?.admissionNo}, class=${u.student?.class}-${u.student?.section}, email=${u.email}\n`;
    });

    // Unique Check
    const loginIds = users.map(u => u.loginId).filter(Boolean);
    const uniqueLoginIds = new Set(loginIds);
    report += `\nUniqueness Check (loginId): ${uniqueLoginIds.size === loginIds.length ? '✅ ALL UNIQUE' : '❌ DUPLICATES FOUND'}\n`;
    report += `Total loginIds: ${loginIds.length}, Unique count: ${uniqueLoginIds.size}\n`;

    fs.writeFileSync(reportPath, report);
    console.log(`✅ Report generated at ${reportPath}`);
    console.log(report);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
