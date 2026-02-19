import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ orderBy: { role: 'asc' }, select: { id: true, email: true, role: true, isActive: true } });
    const students = await prisma.student.findMany({ include: { achievements: true, medicalInfo: true } });
    const teachers = await prisma.teacher.findMany({ include: { subjects: true, classes: true } });
    const grades = await prisma.academicGrade.findMany({ include: { student: true } });
    const notices = await prisma.notice.findMany();
    const settings = await prisma.systemSetting.findMany();
    const attendance = await prisma.attendance.findMany({ include: { student: true } });

    const lines = [];

    lines.push('=== USERS (All Accounts) ===');
    for (const u of users) {
        lines.push(`  Role: ${u.role.padEnd(12)} Email: ${u.email}  Active: ${u.isActive}`);
    }

    lines.push('\n=== STUDENTS ===');
    for (const s of students) {
        lines.push(`  Name:          ${s.firstName} ${s.lastName}`);
        lines.push(`  Admission No:  ${s.admissionNo}`);
        lines.push(`  Frontend ID:   ${s.admissionNo === 'ADM2024001' ? '24BIT0522' : '24BIT0523'}`);
        lines.push(`  Class/Section: ${s.class}-${s.section}  Roll No: ${s.rollNo}`);
        lines.push(`  Date of Birth: ${s.dateOfBirth?.toISOString().split('T')[0] ?? 'N/A'}`);
        lines.push(`  Gender:        ${s.gender}`);
        lines.push(`  Blood Group:   ${s.bloodGroup}`);
        lines.push(`  Status:        ${s.status}`);
        lines.push(`  Attendance:    ${s.attendancePercentage}% (Present: ${s.totalPresent}, Absent: ${s.totalAbsent})`);
        lines.push(`  Parent Name:   ${s.parentName}`);
        lines.push(`  Parent Phone:  ${s.parentPhone}`);
        lines.push(`  Parent Email:  ${s.parentEmail}`);
        if (s.medicalInfo) {
            lines.push(`  Allergies:     ${s.medicalInfo.allergies.join(', ') || 'None'}`);
            lines.push(`  Conditions:    ${s.medicalInfo.chronicConditions.join(', ') || 'None'}`);
            lines.push(`  Last Checkup:  ${s.medicalInfo.lastCheckup?.toISOString().split('T')[0]}`);
        }
        if (s.achievements.length > 0) {
            lines.push(`  Achievements:`);
            for (const a of s.achievements) {
                lines.push(`    - [${a.category}] ${a.title} (${a.date.toISOString().split('T')[0]})`);
            }
        }
        lines.push(`  Login Email:   ${s.admissionNo === 'ADM2024001' ? 'aarav.sharma@student.charronix.edu' : 'priya.patel@student.charronix.edu'}`);
        lines.push(`  Password:      Student@1234`);
        lines.push('  ─────────────────────────────────────────────');
    }

    lines.push('\n=== TEACHERS ===');
    for (const t of teachers) {
        lines.push(`  Name:           ${t.firstName} ${t.lastName}`);
        lines.push(`  Employee ID:    ${t.employeeId}`);
        lines.push(`  Frontend ID:    ${t.employeeId === 'EMP001' ? '100001' : '100002'}`);
        lines.push(`  Email:          ${t.email}`);
        lines.push(`  Phone:          ${t.phone}`);
        lines.push(`  Qualification:  ${t.qualification}`);
        lines.push(`  Date of Joining:${t.dateOfJoining?.toISOString().split('T')[0]}`);
        lines.push(`  Class Teacher of: ${t.isClassTeacherOf ?? 'N/A'}`);
        lines.push(`  Subjects:       ${t.subjects.map(s => s.subject).join(', ')}`);
        lines.push(`  Classes:        ${t.classes.map(c => c.classSection).join(', ')}`);
        lines.push(`  Status:         ${t.status}`);
        lines.push(`  Login Email:    ${t.email}`);
        lines.push(`  Password:       Teacher@1234`);
        lines.push('  ─────────────────────────────────────────────');
    }

    lines.push('\n=== PRINCIPAL / ADMIN ===');
    const admin = users.find(u => u.role === 'ADMIN');
    if (admin) {
        lines.push(`  Role:           ADMIN (acts as Principal)`);
        lines.push(`  Email:          ${admin.email}`);
        lines.push(`  Frontend ID:    900001`);
        lines.push(`  Password:       Admin@1234`);
        lines.push(`  Active:         ${admin.isActive}`);
    }

    lines.push('\n=== PARENTS (linked via student records) ===');
    for (const s of students) {
        lines.push(`  Parent of:     ${s.firstName} ${s.lastName} (${s.admissionNo})`);
        lines.push(`  Parent Name:   ${s.parentName}`);
        lines.push(`  Parent Phone:  ${s.parentPhone}`);
        lines.push(`  Parent Email:  ${s.parentEmail}`);
        lines.push(`  Frontend ID:   ${s.firstName}${s.dateOfBirth?.toISOString().replace(/-/g, '').split('T')[0].slice(4, 8) + s.dateOfBirth?.toISOString().replace(/-/g, '').split('T')[0].slice(2, 4) + s.dateOfBirth?.toISOString().replace(/-/g, '').split('T')[0].slice(0, 4).slice(2, 4)}`);
        lines.push(`  Login Email:   ${s.admissionNo === 'ADM2024001' ? 'aarav.sharma@student.charronix.edu' : 'priya.patel@student.charronix.edu'}`);
        lines.push(`  Password:      Student@1234`);
        lines.push('  ─────────────────────────────────────────────');
    }

    lines.push('\n=== ACADEMIC GRADES ===');
    for (const g of grades) {
        lines.push(`  ${(g.student.firstName + ' ' + g.student.lastName).padEnd(20)} | ${g.subject.padEnd(15)} | ${String(g.score) + '/' + g.maxScore} | Grade: ${g.grade} | ${g.term} ${g.academicYear}`);
    }

    lines.push('\n=== NOTICES ===');
    for (const n of notices) {
        lines.push(`  [${n.priority}] ${n.title}`);
        lines.push(`    Type: ${n.type}  Target: ${n.target}`);
        lines.push(`    Message: ${n.message.slice(0, 80)}...`);
    }

    lines.push('\n=== ATTENDANCE (Last 7 days sample) ===');
    const grouped = {};
    for (const a of attendance) {
        const name = `${a.student.firstName} ${a.student.lastName}`;
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(`${a.date.toISOString().split('T')[0]}:${a.status}`);
    }
    for (const [name, records] of Object.entries(grouped)) {
        lines.push(`  ${name}: ${records.join('  ')}`);
    }

    lines.push('\n=== SYSTEM SETTINGS ===');
    for (const s of settings) {
        lines.push(`  [${s.category}] ${s.key} = ${s.value}`);
    }

    const output = lines.join('\n');
    const fs = await import('fs');
    fs.writeFileSync('db_data_report.txt', output);
    console.log('Done. Written to db_data_report.txt');
    console.log(output);
}

main().catch(console.error).finally(() => prisma.$disconnect());
