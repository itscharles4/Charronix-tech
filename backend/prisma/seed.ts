import { PrismaClient, Role, StudentStatus, NoticeType, NoticePriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ============================================
    // ADMIN USER
    // ============================================
    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@charronix.edu' },
        update: {},
        create: {
            email: 'admin@charronix.edu',
            passwordHash: adminPassword,
            role: Role.ADMIN,
        },
    });
    console.log('✅ Admin user created:', adminUser.email);

    // ============================================
    // TEACHER USERS
    // ============================================
    const teacherPassword = await bcrypt.hash('Teacher@1234', 12);

    const teacherUser1 = await prisma.user.upsert({
        where: { email: 'meera.iyer@charronix.edu' },
        update: {},
        create: {
            email: 'meera.iyer@charronix.edu',
            passwordHash: teacherPassword,
            role: Role.TEACHER,
        },
    });

    const teacherUser2 = await prisma.user.upsert({
        where: { email: 'rajesh.kumar@charronix.edu' },
        update: {},
        create: {
            email: 'rajesh.kumar@charronix.edu',
            passwordHash: teacherPassword,
            role: Role.TEACHER,
        },
    });

    // ============================================
    // TEACHERS
    // ============================================
    const teacher1 = await prisma.teacher.upsert({
        where: { employeeId: 'EMP001' },
        update: {},
        create: {
            userId: teacherUser1.id,
            employeeId: 'EMP001',
            firstName: 'Meera',
            lastName: 'Iyer',
            phone: '9876543211',
            email: 'meera.iyer@charronix.edu',
            qualification: 'M.Sc Mathematics',
            dateOfJoining: new Date('2020-06-01'),
            isClassTeacherOf: '10-A',
            status: 'ACTIVE',
            subjects: {
                create: [
                    { subject: 'Mathematics' },
                    { subject: 'Physics' },
                ],
            },
            classes: {
                create: [
                    { classSection: '10-A' },
                    { classSection: '10-B' },
                ],
            },
        },
    });

    const teacher2 = await prisma.teacher.upsert({
        where: { employeeId: 'EMP002' },
        update: {},
        create: {
            userId: teacherUser2.id,
            employeeId: 'EMP002',
            firstName: 'Rajesh',
            lastName: 'Kumar',
            phone: '9876543212',
            email: 'rajesh.kumar@charronix.edu',
            qualification: 'M.A English',
            dateOfJoining: new Date('2019-07-15'),
            status: 'ACTIVE',
            subjects: {
                create: [
                    { subject: 'English' },
                    { subject: 'Social Studies' },
                ],
            },
            classes: {
                create: [
                    { classSection: '10-A' },
                    { classSection: '9-A' },
                ],
            },
        },
    });

    console.log('✅ Teachers created:', teacher1.firstName, teacher2.firstName);

    // ============================================
    // STUDENT USERS
    // ============================================
    const studentPassword = await bcrypt.hash('Student@1234', 12);

    const studentUser1 = await prisma.user.upsert({
        where: { email: 'aarav.sharma@student.charronix.edu' },
        update: {},
        create: {
            email: 'aarav.sharma@student.charronix.edu',
            passwordHash: studentPassword,
            role: Role.STUDENT,
        },
    });

    const studentUser2 = await prisma.user.upsert({
        where: { email: 'priya.patel@student.charronix.edu' },
        update: {},
        create: {
            email: 'priya.patel@student.charronix.edu',
            passwordHash: studentPassword,
            role: Role.STUDENT,
        },
    });

    // ============================================
    // STUDENTS
    // ============================================
    const student1 = await prisma.student.upsert({
        where: { admissionNo: 'ADM2024001' },
        update: {},
        create: {
            userId: studentUser1.id,
            admissionNo: 'ADM2024001',
            firstName: 'Aarav',
            lastName: 'Sharma',
            dateOfBirth: new Date('2008-03-15'),
            gender: 'MALE',
            class: '10',
            section: 'A',
            rollNo: 1,
            parentName: 'Rajesh Sharma',
            parentPhone: '9876543210',
            parentEmail: 'rajesh.sharma@gmail.com',
            bloodGroup: 'B+',
            status: StudentStatus.ACTIVE,
            attendancePercentage: 94,
            totalPresent: 94,
            totalAbsent: 6,
            medicalInfo: {
                create: {
                    bloodGroup: 'B+',
                    allergies: ['Peanuts'],
                    chronicConditions: ['None'],
                    lastCheckup: new Date('2025-11-15'),
                },
            },
            achievements: {
                create: [
                    { title: 'Science Olympiad Gold', date: new Date('2025-01-15'), category: 'Academic', description: 'First place in district science olympiad' },
                    { title: 'Chess Champion', date: new Date('2024-11-20'), category: 'Sports', description: 'School chess tournament winner' },
                ],
            },
        },
    });

    const student2 = await prisma.student.upsert({
        where: { admissionNo: 'ADM2024002' },
        update: {},
        create: {
            userId: studentUser2.id,
            admissionNo: 'ADM2024002',
            firstName: 'Priya',
            lastName: 'Patel',
            dateOfBirth: new Date('2008-07-22'),
            gender: 'FEMALE',
            class: '10',
            section: 'A',
            rollNo: 2,
            parentName: 'Suresh Patel',
            parentPhone: '9876543213',
            parentEmail: 'suresh.patel@gmail.com',
            bloodGroup: 'O+',
            status: StudentStatus.ACTIVE,
            attendancePercentage: 98,
            totalPresent: 98,
            totalAbsent: 2,
            medicalInfo: {
                create: {
                    bloodGroup: 'O+',
                    allergies: [],
                    chronicConditions: ['None'],
                    lastCheckup: new Date('2025-10-10'),
                },
            },
        },
    });

    console.log('✅ Students created:', student1.firstName, student2.firstName);

    // ============================================
    // ACADEMIC GRADES
    // ============================================
    const gradeData = [
        { studentId: student1.id, subject: 'Mathematics', score: 92, maxScore: 100, grade: 'A+', term: 'Term 1', academicYear: '2024-25', enteredById: teacher1.id },
        { studentId: student1.id, subject: 'Physics', score: 88, maxScore: 100, grade: 'A', term: 'Term 1', academicYear: '2024-25', enteredById: teacher1.id },
        { studentId: student1.id, subject: 'English', score: 85, maxScore: 100, grade: 'A', term: 'Term 1', academicYear: '2024-25', enteredById: teacher2.id },
        { studentId: student1.id, subject: 'Social Studies', score: 78, maxScore: 100, grade: 'B+', term: 'Term 1', academicYear: '2024-25', enteredById: teacher2.id },
        { studentId: student2.id, subject: 'Mathematics', score: 96, maxScore: 100, grade: 'A+', term: 'Term 1', academicYear: '2024-25', enteredById: teacher1.id },
        { studentId: student2.id, subject: 'English', score: 94, maxScore: 100, grade: 'A+', term: 'Term 1', academicYear: '2024-25', enteredById: teacher2.id },
    ];

    for (const g of gradeData) {
        await prisma.academicGrade.create({ data: g });
    }
    console.log('✅ Academic grades created');

    // ============================================
    // ATTENDANCE (last 7 days)
    // ============================================
    const students = [student1, student2];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        for (const student of students) {
            await prisma.attendance.upsert({
                where: { studentId_date: { studentId: student.id, date } },
                update: {},
                create: {
                    studentId: student.id,
                    date,
                    status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
                    markedById: teacher1.id,
                },
            });
        }
    }
    console.log('✅ Attendance records created');

    // ============================================
    // NOTICES
    // ============================================
    await prisma.notice.createMany({
        data: [
            {
                title: 'Annual Sports Day',
                message: 'Annual Sports Day will be held on March 15th. All students must participate.',
                target: 'ALL',
                date: new Date(),
                author: 'Principal',
                type: NoticeType.EVENT,
                priority: NoticePriority.HIGH,
                createdById: adminUser.id,
            },
            {
                title: 'Term 2 Examinations',
                message: 'Term 2 examinations will commence from April 1st. Timetable attached.',
                target: 'STUDENTS',
                date: new Date(),
                author: 'Academic Department',
                type: NoticeType.EXAM,
                priority: NoticePriority.URGENT,
                createdById: adminUser.id,
            },
            {
                title: 'Parent-Teacher Meeting',
                message: 'PTM scheduled for February 28th from 9 AM to 1 PM.',
                target: 'PARENTS',
                date: new Date(),
                author: 'Administration',
                type: NoticeType.GENERAL,
                priority: NoticePriority.NORMAL,
                createdById: adminUser.id,
            },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Notices created');

    // ============================================
    // SYSTEM SETTINGS
    // ============================================
    const settings = [
        { key: 'school_name', value: 'Charronix International School', category: 'SCHOOL' as const },
        { key: 'school_address', value: '123 Education Lane, Knowledge City', category: 'SCHOOL' as const },
        { key: 'school_phone', value: '+91-9876543200', category: 'SCHOOL' as const },
        { key: 'school_email', value: 'info@charronix.edu', category: 'SCHOOL' as const },
        { key: 'academic_year', value: '2024-25', category: 'SCHOOL' as const },
        { key: 'attendance_threshold', value: '75', category: 'SCHOOL' as const },
    ];

    for (const s of settings) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { ...s, updatedBy: adminUser.id },
        });
    }
    console.log('✅ System settings created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin:   admin@charronix.edu / Admin@1234');
    console.log('  Teacher: meera.iyer@charronix.edu / Teacher@1234');
    console.log('  Student: aarav.sharma@student.charronix.edu / Student@1234');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
