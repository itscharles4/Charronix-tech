"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function hashPassword(password) {
    return `$2b$12$test${password.padEnd(54, '0')}`;
}
async function seedDatabase() {
    try {
        console.log('🌱 Starting Phase 2 - Database Seed Data Insertion...\n');
        console.log('👤 Creating users...');
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@charronix.school' },
            update: {},
            create: {
                email: 'admin@charronix.school',
                passwordHash: await hashPassword('admin123'),
                role: 'ADMIN',
                loginId: 'ADMIN001',
                isActive: true,
            },
        });
        const principalUser = await prisma.user.upsert({
            where: { email: 'principal@charronix.school' },
            update: {},
            create: {
                email: 'principal@charronix.school',
                passwordHash: await hashPassword('principal123'),
                role: 'PRINCIPAL',
                loginId: 'PRIN001',
                isActive: true,
            },
        });
        const teacherUsers = [];
        const teacherEmails = [
            'teacher1@charronix.school',
            'teacher2@charronix.school',
            'teacher3@charronix.school',
            'teacher4@charronix.school',
            'teacher5@charronix.school',
        ];
        for (let i = 0; i < teacherEmails.length; i++) {
            const user = await prisma.user.upsert({
                where: { email: teacherEmails[i] },
                update: {},
                create: {
                    email: teacherEmails[i],
                    passwordHash: await hashPassword('teacher123'),
                    role: 'TEACHER',
                    loginId: `TCH${String(i + 1).padStart(3, '0')}`,
                    isActive: true,
                },
            });
            teacherUsers.push(user);
        }
        const studentEmails = [
            'nisha.rao@charronix.school',
            'diya.verma@charronix.school',
            'arjun.kumar@charronix.school',
            'priya.singh@charronix.school',
            'rahul.patel@charronix.school',
        ];
        const studentUsers = [];
        for (let i = 0; i < studentEmails.length; i++) {
            const user = await prisma.user.upsert({
                where: { email: studentEmails[i] },
                update: {},
                create: {
                    email: studentEmails[i],
                    passwordHash: await hashPassword('student123'),
                    role: 'STUDENT',
                    loginId: `STU${String(i + 1).padStart(3, '0')}`,
                    isActive: true,
                },
            });
            studentUsers.push(user);
        }
        console.log(`  ✅ Created ${teacherUsers.length} teachers and ${studentUsers.length} students`);
        console.log('👨‍🏫 Creating teacher profiles...');
        const teacherDataArray = [
            {
                userId: teacherUsers[0].id,
                employeeId: 'EMP001',
                firstName: 'Priya',
                lastName: 'Iyer',
                phone: '9876543210',
                email: 'teacher1@charronix.school',
                qualification: 'M.Sc Physics',
                dateOfJoining: new Date('2023-06-01'),
            },
            {
                userId: teacherUsers[1].id,
                employeeId: 'EMP002',
                firstName: 'Rajesh',
                lastName: 'Kumar',
                phone: '9876543211',
                email: 'teacher2@charronix.school',
                qualification: 'M.Sc Mathematics',
                dateOfJoining: new Date('2023-06-01'),
            },
            {
                userId: teacherUsers[2].id,
                employeeId: 'EMP003',
                firstName: 'Anjali',
                lastName: 'Sharma',
                phone: '9876543212',
                email: 'teacher3@charronix.school',
                qualification: 'M.A English',
                dateOfJoining: new Date('2023-09-01'),
            },
            {
                userId: teacherUsers[3].id,
                employeeId: 'EMP004',
                firstName: 'Vikram',
                lastName: 'Singh',
                phone: '9876543213',
                email: 'teacher4@charronix.school',
                qualification: 'B.Sc Chemistry',
                dateOfJoining: new Date('2023-09-01'),
            },
            {
                userId: teacherUsers[4].id,
                employeeId: 'EMP005',
                firstName: 'Deepa',
                lastName: 'Nair',
                phone: '9876543214',
                email: 'teacher5@charronix.school',
                qualification: 'M.Com Commerce',
                dateOfJoining: new Date('2024-01-15'),
            },
        ];
        const createdTeachers = [];
        for (const teacherData of teacherDataArray) {
            const created = await prisma.teacher.upsert({
                where: { employeeId: teacherData.employeeId },
                update: {},
                create: {
                    ...teacherData,
                    status: 'ACTIVE',
                },
            });
            createdTeachers.push(created);
        }
        console.log(`  ✅ Created ${createdTeachers.length} teacher profiles`);
        console.log('👨‍🎓 Creating student profiles...');
        const studentData = [
            {
                userId: studentUsers[0].id,
                admissionNo: 'ADM2024001',
                firstName: 'Nisha',
                lastName: 'Rao',
                dateOfBirth: new Date('2010-03-15'),
                gender: 'Female',
                class: '10',
                section: 'A',
                rollNo: 1,
                parentName: 'Rajesh Rao',
                parentPhone: '9812345678',
                parentEmail: 'rajesh.rao@email.com',
                bloodGroup: 'O+',
            },
            {
                userId: studentUsers[1].id,
                admissionNo: 'ADM2024002',
                firstName: 'Diya',
                lastName: 'Verma',
                dateOfBirth: new Date('2010-05-22'),
                gender: 'Female',
                class: '10',
                section: 'A',
                rollNo: 2,
                parentName: 'Amit Verma',
                parentPhone: '9812345679',
                parentEmail: 'amit.verma@email.com',
                bloodGroup: 'B+',
            },
            {
                userId: studentUsers[2].id,
                admissionNo: 'ADM2024003',
                firstName: 'Arjun',
                lastName: 'Kumar',
                dateOfBirth: new Date('2010-07-11'),
                gender: 'Male',
                class: '10',
                section: 'B',
                rollNo: 3,
                parentName: 'Vikram Kumar',
                parentPhone: '9812345680',
                parentEmail: 'vikram.kumar@email.com',
                bloodGroup: 'A+',
            },
            {
                userId: studentUsers[3].id,
                admissionNo: 'ADM2024004',
                firstName: 'Priya',
                lastName: 'Singh',
                dateOfBirth: new Date('2010-02-28'),
                gender: 'Female',
                class: '10',
                section: 'B',
                rollNo: 4,
                parentName: 'Suresh Singh',
                parentPhone: '9812345681',
                parentEmail: 'suresh.singh@email.com',
                bloodGroup: 'AB+',
            },
            {
                userId: studentUsers[4].id,
                admissionNo: 'ADM2024005',
                firstName: 'Rahul',
                lastName: 'Patel',
                dateOfBirth: new Date('2010-09-19'),
                gender: 'Male',
                class: '10',
                section: 'A',
                rollNo: 5,
                parentName: 'Nitin Patel',
                parentPhone: '9812345682',
                parentEmail: 'nitin.patel@email.com',
                bloodGroup: 'O-',
            },
        ];
        const createdStudents = [];
        for (const student of studentData) {
            const created = await prisma.student.upsert({
                where: { admissionNo: student.admissionNo },
                update: {},
                create: {
                    ...student,
                    status: 'ACTIVE',
                    totalPresent: 45,
                    totalAbsent: 5,
                    attendancePercentage: 90.0,
                },
            });
            createdStudents.push(created);
            await prisma.medicalInfo.upsert({
                where: { studentId: created.id },
                update: {},
                create: {
                    studentId: created.id,
                    bloodGroup: student.bloodGroup,
                    allergies: student.bloodGroup === 'A+' ? ['Milk'] : student.bloodGroup === 'O-' ? ['Eggs'] : ['Peanuts'],
                    chronicConditions: student.bloodGroup === 'A+' ? ['Asthma'] : [],
                    lastCheckup: new Date(),
                    emergencyContact: student.parentPhone,
                    notes: 'Healthy',
                },
            });
        }
        console.log(`  ✅ Created ${createdStudents.length} students with medical info`);
        console.log('📝 Creating academic grades...');
        const subjects = ['History', 'English', 'Chemistry', 'Physics', 'Mathematics', 'Hindi'];
        const grades = [];
        for (const student of createdStudents) {
            for (const subject of subjects) {
                const score = Math.floor(Math.random() * 30) + 65;
                let grade = 'A+';
                if (score < 70)
                    grade = 'B+';
                if (score < 65)
                    grade = 'B';
                if (score < 60)
                    grade = 'C';
                grades.push({
                    studentId: student.id,
                    subject,
                    score: parseFloat(score.toString()),
                    maxScore: 100,
                    grade,
                    term: 'Term 1',
                    academicYear: '2025-26',
                    enteredById: createdTeachers[0].id,
                });
            }
        }
        for (const gradeData of grades) {
            await prisma.academicGrade.create({
                data: gradeData,
            });
        }
        console.log(`  ✅ Created ${grades.length} academic grade records`);
        console.log('🏆 Creating achievements...');
        const achievements = [];
        const achievementTypes = [
            { title: 'Perfect Attendance', category: 'Academic' },
            { title: 'Math Olympiad Participant', category: 'Academic' },
            { title: 'Debate Team Captain', category: 'Cultural' },
            { title: 'Merit Scholarship', category: 'Academic' },
            { title: 'Sports Excellence', category: 'Sports' },
        ];
        for (let i = 0; i < createdStudents.length; i++) {
            for (let j = 0; j < 2; j++) {
                const achievement = achievementTypes[Math.floor(Math.random() * achievementTypes.length)];
                achievements.push({
                    studentId: createdStudents[i].id,
                    title: achievement.title,
                    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    category: achievement.category,
                    description: `Achievement for ${createdStudents[i].firstName}`,
                });
            }
        }
        for (const ach of achievements) {
            await prisma.achievement.create({
                data: ach,
            });
        }
        console.log(`  ✅ Created ${achievements.length} achievement records`);
        console.log('🔔 Creating notifications...');
        const notificationTypes = [
            { title: 'Mid-Term Exam Schedule Released', message: 'Exam schedule for Term 1 has been published.' },
            { title: 'Assignment Due Reminder', message: 'Mathematics assignment due on Feb 24.' },
            { title: 'Achievement Unlocked', message: 'Congratulations! Perfect Attendance badge earned!' },
            { title: 'Low Attendance Alert', message: 'Your attendance is below 75% warning threshold.' },
            { title: 'Grades Published', message: 'Term 1 grades are now available in student portal.' },
        ];
        for (const student of studentUsers) {
            for (let i = 0; i < 4; i++) {
                const notif = notificationTypes[i % notificationTypes.length];
                await prisma.notification.create({
                    data: {
                        userId: student.id,
                        title: notif.title,
                        message: notif.message,
                        type: 'INFO',
                        isRead: Math.random() > 0.5,
                    },
                });
            }
        }
        console.log(`  ✅ Created notifications for all students`);
        console.log('✅ Creating attendance records...');
        const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'];
        let attendanceCount = 0;
        for (const student of createdStudents) {
            for (let day = 1; day <= 22; day++) {
                const date = new Date(2026, 1, day);
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6)
                    continue;
                const random = Math.random() * 100;
                let status = 'PRESENT';
                if (random > 90)
                    status = 'ABSENT';
                else if (random > 80)
                    status = 'LATE';
                else if (random > 75)
                    status = 'LEAVE';
                await prisma.attendance.create({
                    data: {
                        studentId: student.id,
                        date,
                        status: status,
                        markedById: createdTeachers[0].id,
                        remarks: status === 'PRESENT' ? '-' : 'Marked by system',
                    },
                });
                attendanceCount++;
            }
        }
        console.log(`  ✅ Created ${attendanceCount} attendance records`);
        console.log('\n📊 Final Data Summary:');
        console.log(`  👤 Users: ${await prisma.user.count()}`);
        console.log(`  👨‍🎓 Students: ${await prisma.student.count()}`);
        console.log(`  👨‍🏫 Teachers: ${await prisma.teacher.count()}`);
        console.log(`  📝 Academic Grades: ${await prisma.academicGrade.count()}`);
        console.log(`  🏆 Achievements: ${await prisma.achievement.count()}`);
        console.log(`  🔔 Notifications: ${await prisma.notification.count()}`);
        console.log(`  ✅ Attendance Records: ${await prisma.attendance.count()}`);
        console.log(`  🏥 Medical Info: ${await prisma.medicalInfo.count()}`);
        console.log('\n✨ Phase 2 - Database Seeding Completed Successfully!\n');
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
seedDatabase().catch(console.error);
//# sourceMappingURL=seed-phase2.js.map