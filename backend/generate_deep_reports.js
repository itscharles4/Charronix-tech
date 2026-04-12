"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔍 Scanning database for EXHAUSTIVE report...');
    const users = await prisma.user.findMany({
        include: {
            student: true,
            teacher: { include: { subjects: true, classes: true } }
        },
        orderBy: { createdAt: 'asc' }
    });
    const students = await prisma.student.findMany({
        include: {
            medicalInfo: true,
            achievements: true,
            academicGrades: true,
            attendance: true
        },
        orderBy: { admissionNo: 'asc' }
    });
    const teachers = await prisma.teacher.findMany({
        include: {
            subjects: true,
            classes: true,
            attendance: { take: 10 },
            academicGrades: { take: 10 }
        },
        orderBy: { employeeId: 'asc' }
    });
    const attendance = await prisma.attendance.findMany({
        include: { student: true, markedBy: true },
        orderBy: { date: 'desc' }
    });
    const grades = await prisma.academicGrade.findMany({
        include: { student: true, enteredBy: true },
        orderBy: { createdAt: 'desc' }
    });
    const notices = await prisma.notice.findMany({ orderBy: { createdAt: 'desc' } });
    const settings = await prisma.systemSetting.findMany();
    let dataReport = '=== CHARRONIX EXHAUSTIVE DATABASE REPORT ===\n';
    dataReport += `Generated: ${new Date().toISOString()}\n\n`;
    dataReport += `[SUMMARY]\n`;
    dataReport += `Total Users: ${users.length}\n`;
    dataReport += `Total Students: ${students.length}\n`;
    dataReport += `Total Teachers: ${teachers.length}\n`;
    dataReport += `Total Attendance Records: ${attendance.length}\n`;
    dataReport += `Total Academic Grades: ${grades.length}\n`;
    dataReport += `Total Notices: ${notices.length}\n`;
    dataReport += `Total System Settings: ${settings.length}\n\n`;
    dataReport += `============================================\n`;
    dataReport += `I. PRINCIPAL / ADMIN ACCOUNTS\n`;
    dataReport += `============================================\n`;
    users.filter(u => u.role === 'ADMIN' || u.role === 'PRINCIPAL').forEach(u => {
        dataReport += `  Email:          ${u.email}\n`;
        dataReport += `  Frontend ID:    ${u.loginId}\n`;
        dataReport += `  Role:           ${u.role}\n`;
        dataReport += `  Active:         ${u.isActive}\n`;
        dataReport += `  Created:        ${u.createdAt.toISOString()}\n`;
        dataReport += `--------------------------------------------\n`;
    });
    dataReport += `\n============================================\n`;
    dataReport += `II. TEACHER RECORDS (Total: ${teachers.length})\n`;
    dataReport += `============================================\n`;
    teachers.forEach((t, index) => {
        const user = users.find(u => u.id === t.userId);
        dataReport += `[${index + 1}] Teacher Profile:\n`;
        dataReport += `  Name:           ${t.firstName} ${t.lastName}\n`;
        dataReport += `  Employee ID:    ${t.employeeId}\n`;
        dataReport += `  Frontend ID:    ${user?.loginId || 'N/A'}\n`;
        dataReport += `  Email:          ${t.email || user?.email}\n`;
        dataReport += `  Phone:          ${t.phone}\n`;
        dataReport += `  Qualification:  ${t.qualification}\n`;
        dataReport += `  Joining Date:   ${t.dateOfJoining ? t.dateOfJoining.toISOString().split('T')[0] : 'N/A'}\n`;
        dataReport += `  Class Teacher:  ${t.isClassTeacherOf || 'None'}\n`;
        dataReport += `  Subjects:       ${t.subjects.map(s => s.subject).join(', ')}\n`;
        dataReport += `  Classes:        ${t.classes.map(c => c.classSection).join(', ')}\n`;
        dataReport += `  Status:         ${t.status}\n`;
        dataReport += `--------------------------------------------\n`;
    });
    dataReport += `\n============================================\n`;
    dataReport += `III. STUDENT RECORDS (Total: ${students.length})\n`;
    dataReport += `============================================\n`;
    students.forEach((s, index) => {
        const user = users.find(u => u.id === s.userId);
        dataReport += `[${index + 1}] Student Profile:\n`;
        dataReport += `  Name:           ${s.firstName} ${s.lastName}\n`;
        dataReport += `  Admission No:   ${s.admissionNo}\n`;
        dataReport += `  Frontend ID:    ${user?.loginId || 'N/A'}\n`;
        dataReport += `  Email:          ${user?.email}\n`;
        dataReport += `  Class/Section:  ${s.class}-${s.section}\n`;
        dataReport += `  Roll No:        ${s.rollNo}\n`;
        dataReport += `  Gender:         ${s.gender}\n`;
        dataReport += `  Parent Name:    ${s.parentName}\n`;
        dataReport += `  Parent Phone:   ${s.parentPhone}\n`;
        dataReport += `  Parent Email:   ${s.parentEmail || 'N/A'}\n`;
        dataReport += `  Blood Group:    ${s.bloodGroup || 'N/A'}\n`;
        dataReport += `  Attendance:     ${s.attendancePercentage}% (Pres: ${s.totalPresent}, Abs: ${s.totalAbsent})\n`;
        dataReport += `  Status:         ${s.status}\n`;
        if (s.medicalInfo) {
            dataReport += `  Medical Info:   Blood=${s.medicalInfo.bloodGroup}, Allergies=${s.medicalInfo.allergies.join(', ') || 'None'}\n`;
        }
        if (s.achievements.length > 0) {
            dataReport += `  Achievements:   ${s.achievements.map(a => a.title).join(', ')}\n`;
        }
        dataReport += `--------------------------------------------\n`;
    });
    dataReport += `\n============================================\n`;
    dataReport += `IV. ATTENDANCE LOGS (Total: ${attendance.length})\n`;
    dataReport += `============================================\n`;
    if (attendance.length === 0) {
        dataReport += `  (No attendance records found in database)\n`;
    }
    else {
        attendance.forEach((a, index) => {
            dataReport += `[${index + 1}] ${a.date.toISOString().split('T')[0]} | Student: ${a.student.firstName} ${a.student.lastName} (${a.student.admissionNo}) | Status: ${a.status} | Marked By: ${a.markedBy?.firstName || 'System'}\n`;
        });
    }
    dataReport += `\n============================================\n`;
    dataReport += `V. ACADEMIC GRADES (Total: ${grades.length})\n`;
    dataReport += `============================================\n`;
    if (grades.length === 0) {
        dataReport += `  (No academic grade records found in database)\n`;
    }
    else {
        grades.forEach((g, index) => {
            dataReport += `[${index + 1}] Student: ${g.student.firstName} ${g.student.lastName} | Subject: ${g.subject} | Score: ${g.score}/${g.maxScore} | Grade: ${g.grade} | Term: ${g.term}\n`;
        });
    }
    dataReport += `\n============================================\n`;
    dataReport += `VI. NOTICES & SYSTEM SETTINGS\n`;
    dataReport += `============================================\n`;
    dataReport += `Notices:\n`;
    notices.forEach(n => {
        dataReport += `  - [${n.type}] ${n.title} (by ${n.author}, ${n.date.toISOString().split('T')[0]})\n`;
    });
    dataReport += `\nSystem Settings:\n`;
    settings.forEach(s => {
        dataReport += `  - ${s.key}: ${s.value}\n`;
    });
    fs_1.default.writeFileSync('./db_data_report.txt', dataReport);
    console.log('✅ Exhaustive report generated at ./db_data_report.txt');
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=generate_deep_reports.js.map