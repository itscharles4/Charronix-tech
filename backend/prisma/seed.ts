

import { PrismaClient, Role, StudentStatus, NoticeType, NoticePriority, VehicleType, VehicleStatus, FuelType, PickupType, BoardingType, ScanMethod } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed (FIXED VERSION)...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.boardingLog.deleteMany();
    await prisma.studentTransport.deleteMany();
    await prisma.routeStop.deleteMany();
    await prisma.route.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.academicGrade.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.medicalInfo.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacherSubject.deleteMany();
    await prisma.teacherClass.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.notice.deleteMany();
    await prisma.timetable.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.user.deleteMany();

    // Hash default passwords
    const hashedPasswordAdmin = await bcrypt.hash('Admin@1234', 12);
    const hashedPasswordTeacher = await bcrypt.hash('Teacher@1234', 12);
    const hashedPasswordStudent = await bcrypt.hash('Student@1234', 12);

    // ============================================
    // CREATE PRINCIPAL/ADMIN
    // ============================================
    console.log('👨💼 Creating Principal/Admin...');
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@charronix.edu',
            passwordHash: hashedPasswordAdmin,
            role: Role.ADMIN,
            loginId: '900001',
            isActive: true,
        },
    });
    console.log('✅ Principal created with loginId:', adminUser.loginId);

    // ============================================
    // CREATE TEACHERS (30 teachers)
    // ============================================
    console.log('👩🏫 Creating teachers...');
    const teacherNames = [
        { firstName: 'Meera', lastName: 'Iyer', phone: '9876543211', subjects: ['Mathematics', 'Physics'], classes: ['10-A', '10-B'], classTeacher: '10-A' },
        { firstName: 'Rajesh', lastName: 'Kumar', phone: '9876543212', subjects: ['English', 'Social Studies'], classes: ['10-A', '9-A'], classTeacher: null },
        { firstName: 'Sunita', lastName: 'Iyer', phone: '9876504003', subjects: ['Chemistry', 'Biology'], classes: ['10-B'], classTeacher: null },
        { firstName: 'Karan', lastName: 'Kumar', phone: '9876504004', subjects: ['Biology', 'English'], classes: ['11-A'], classTeacher: null },
        { firstName: 'Deepa', lastName: 'Singh', phone: '9876504005', subjects: ['English', 'History'], classes: ['12-B'], classTeacher: null },
        { firstName: 'Sanjay', lastName: 'Gupta', phone: '9876504006', subjects: ['History', 'Geography'], classes: ['7-A'], classTeacher: null },
        { firstName: 'Neha', lastName: 'Rao', phone: '9876504007', subjects: ['Geography', 'Computer Science'], classes: ['8-B'], classTeacher: null },
        { firstName: 'Amit', lastName: 'Mehta', phone: '9876504008', subjects: ['Computer Science', 'Art'], classes: ['9-A'], classTeacher: null },
        { firstName: 'Renu', lastName: 'Joshi', phone: '9876504009', subjects: ['Art', 'Physical Education'], classes: ['10-B'], classTeacher: null },
        { firstName: 'Harish', lastName: 'Bose', phone: '9876504010', subjects: ['Physical Education', 'Economics'], classes: ['11-A'], classTeacher: null },
        { firstName: 'Priya', lastName: 'Chatterjee', phone: '9876504011', subjects: ['Economics', 'Accountancy'], classes: ['12-B'], classTeacher: null },
        { firstName: 'Rohit', lastName: 'Nair', phone: '9876504012', subjects: ['Accountancy', 'Mathematics'], classes: ['7-A'], classTeacher: null },
        { firstName: 'Suresh', lastName: 'Khan', phone: '9876504013', subjects: ['Mathematics', 'Physics'], classes: ['8-B'], classTeacher: null },
        { firstName: 'Meena', lastName: 'Desai', phone: '9876504014', subjects: ['Physics', 'Chemistry'], classes: ['9-A'], classTeacher: null },
        { firstName: 'Varun', lastName: 'Menon', phone: '9876504015', subjects: ['Chemistry', 'Biology'], classes: ['10-B'], classTeacher: null },
        { firstName: 'Rakesh', lastName: 'Sharma', phone: '9876504016', subjects: ['Biology', 'English'], classes: ['11-A'], classTeacher: null },
        { firstName: 'Shreya', lastName: 'Patel', phone: '9876504017', subjects: ['English', 'History'], classes: ['12-B'], classTeacher: null },
        { firstName: 'Kabir', lastName: 'Iyer', phone: '9876504018', subjects: ['History', 'Geography'], classes: ['7-A'], classTeacher: null },
        { firstName: 'Lata', lastName: 'Kumar', phone: '9876504019', subjects: ['Geography', 'Computer Science'], classes: ['8-B'], classTeacher: null },
        { firstName: 'Manish', lastName: 'Singh', phone: '9876504020', subjects: ['Computer Science', 'Art'], classes: ['9-A'], classTeacher: null },
        { firstName: 'Rekha', lastName: 'Gupta', phone: '9876504021', subjects: ['Art', 'Physical Education'], classes: ['10-B'], classTeacher: null },
        { firstName: 'Gopal', lastName: 'Rao', phone: '9876504022', subjects: ['Physical Education', 'Economics'], classes: ['11-A'], classTeacher: null },
        { firstName: 'Kavita', lastName: 'Mehta', phone: '9876504023', subjects: ['Economics', 'Accountancy'], classes: ['12-B'], classTeacher: null },
        { firstName: 'Nisha', lastName: 'Joshi', phone: '9876504024', subjects: ['Accountancy', 'Mathematics'], classes: ['7-A'], classTeacher: null },
        { firstName: 'Dev', lastName: 'Bose', phone: '9876504025', subjects: ['Mathematics', 'Physics'], classes: ['8-B'], classTeacher: null },
        { firstName: 'Ritu', lastName: 'Chatterjee', phone: '9876504026', subjects: ['Physics', 'Chemistry'], classes: ['9-A'], classTeacher: null },
        { firstName: 'Arjun', lastName: 'Nair', phone: '9876504027', subjects: ['Chemistry', 'Biology'], classes: ['10-B'], classTeacher: null },
        { firstName: 'Sonia', lastName: 'Khan', phone: '9876504028', subjects: ['Biology', 'English'], classes: ['11-A'], classTeacher: null },
        { firstName: 'Pooja', lastName: 'Desai', phone: '9876504029', subjects: ['English', 'History'], classes: ['12-B'], classTeacher: null },
        { firstName: 'Nitin', lastName: 'Menon', phone: '9876504030', subjects: ['History', 'Geography'], classes: ['7-A'], classTeacher: null },
    ];

    let teacherCounter = 1;
    for (const teacherData of teacherNames) {
        const frontendId = `${100000 + teacherCounter}`;
        const employeeId = `EMP${String(teacherCounter).padStart(3, '0')}`;
        const email = `${teacherData.firstName.toLowerCase()}.${teacherData.lastName.toLowerCase()}${teacherCounter}@charronix.edu`;

        const teacherUser = await prisma.user.create({
            data: {
                email: email,
                passwordHash: hashedPasswordTeacher,
                role: Role.TEACHER,
                loginId: frontendId,
                isActive: true,
            },
        });

        await prisma.teacher.create({
            data: {
                userId: teacherUser.id,
                employeeId: employeeId,
                firstName: teacherData.firstName,
                lastName: teacherData.lastName,
                phone: teacherData.phone,
                email: email,
                qualification: 'M.A / M.Sc',
                dateOfJoining: new Date(`2018-01-${String(teacherCounter).padStart(2, '0')}`),
                isClassTeacherOf: teacherData.classTeacher,
                subjects: {
                    create: teacherData.subjects.map(s => ({ subject: s }))
                },
                classes: {
                    create: teacherData.classes.map(c => ({ classSection: c }))
                }
            },
        });

        console.log(`✅ Teacher ${teacherCounter}: ${teacherData.firstName} ${teacherData.lastName} (loginId: ${frontendId})`);
        teacherCounter++;
    }

    // ============================================
    // CREATE STUDENTS (100 students)
    // ============================================
    console.log('👨🎓 Creating students...');
    const firstNames = ['Aarav', 'Priya', 'Rohan', 'Sanya', 'Kabir', 'Isha', 'Ritu', 'Ravi', 'Neha', 'Vikram', 'Ananya', 'Karan', 'Manav', 'Nisha', 'Soham', 'Diya', 'Imran', 'Tara', 'Maya', 'Arjun', 'Rahul', 'Simran', 'Ved', 'Tanvi', 'Kunal'];
    const lastNames = ['Sharma', 'Patel', 'Kumar', 'Iyer', 'Gupta', 'Singh', 'Mehta', 'Rao', 'Khan', 'Verma', 'Joshi', 'Nair', 'Desai'];

    const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const sections = ['A', 'B'];

    let studentCounter = 522;
    for (const className of classes) {
        for (const section of sections) {
            for (let i = 1; i <= 5; i++) {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const frontendId = `24BIT${String(studentCounter).padStart(4, '0')}`;
                const admissionNo = `ADM2024${String(studentCounter).padStart(3, '0')}`;
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentCounter}@student.charronix.edu`;

                const studentUser = await prisma.user.create({
                    data: {
                        email: email,
                        passwordHash: hashedPasswordStudent,
                        role: Role.STUDENT,
                        loginId: frontendId,
                        isActive: true,
                    },
                });

                const student = await prisma.student.create({
                    data: {
                        userId: studentUser.id,
                        admissionNo: admissionNo,
                        firstName: firstName,
                        lastName: lastName,
                        dateOfBirth: new Date(2008 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1),
                        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
                        class: className,
                        section: section,
                        rollNo: i,
                        parentName: `${lastName} Parents`,
                        parentPhone: `987650${String(5000 + studentCounter).slice(-4)}`,
                        parentEmail: `parent.${firstName.toLowerCase()}${studentCounter}@example.com`,
                        status: StudentStatus.ACTIVE,
                        attendancePercentage: 85 + Math.floor(Math.random() * 15),
                        totalPresent: 180,
                        totalAbsent: 20,
                        medicalInfo: {
                            create: {
                                bloodGroup: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
                                allergies: i % 10 === 0 ? ['Peanuts'] : [],
                                chronicConditions: [],
                                lastCheckup: new Date('2025-10-01'),
                            }
                        }
                    },
                });

                console.log(`✅ Student ${studentCounter}: ${firstName} ${lastName} (loginId: ${frontendId}, class: ${className}-${section})`);

                // ============================================
                // ADD GRADES (5 subjects)
                // ============================================
                const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History'];
                const academicYear = '2025-26';
                const term = 'Term 1';

                for (const sub of subjects) {
                    const score = 70 + Math.floor(Math.random() * 30); // 70-100
                    let grade = 'B';
                    if (score >= 90) grade = 'A+';
                    else if (score >= 80) grade = 'A';
                    else if (score >= 70) grade = 'B+';

                    await prisma.academicGrade.create({
                        data: {
                            studentId: student.id,
                            subject: sub,
                            score: score,
                            maxScore: 100,
                            grade: grade,
                            term: term,
                            academicYear: academicYear,
                        }
                    });
                }

                // ============================================
                // ADD ACHIEVEMENTS (2-3)
                // ============================================
                const achievementTemplates = [
                    { title: 'Math Olympiad - Gold', category: 'ACADEMIC', desc: 'Secured first place in regional math olympiad' },
                    { title: 'Football MVP', category: 'SPORTS', desc: 'Best player in annual tournament' },
                    { title: 'Science Fair Winner', category: 'ACADEMIC', desc: 'Outstanding project on renewable energy' },
                    { title: 'Dance Performance Star', category: 'CULTURAL', desc: 'Winner of inter-school dance competition' },
                    { title: 'Class Monitor', category: 'LEADERSHIP', desc: 'Elected for leadership qualities' },
                    { title: 'Singing Finalist', category: 'CULTURAL', desc: 'Reached finals in national junior singing' },
                    { title: 'Chess Champion', category: 'SPORTS', desc: 'School chess tournament winner' },
                    { title: 'Perfect Attendance', category: 'ACADEMIC', desc: '100% attendance during first term' }
                ];

                const numAchievements = 2 + (studentCounter % 2); // 2 or 3
                const shuffled = [...achievementTemplates].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, numAchievements);

                for (const ach of selected) {
                    await prisma.achievement.create({
                        data: {
                            studentId: student.id,
                            title: ach.title,
                            category: ach.category,
                            description: ach.desc,
                            date: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
                        }
                    });
                }

                studentCounter++;
            }
        }
    }

    // ============================================
    // SEED ATTENDANCE & GRADES (Sample for first 10 students)
    // ============================================
    console.log('📝 Seeding Attendance and Grades...');
    const allStudents = await prisma.student.findMany({ take: 10 });
    const allTeachers = await prisma.teacher.findMany({ take: 5 });

    for (const student of allStudents) {
        // Create 5 attendance records per student
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            await prisma.attendance.create({
                data: {
                    studentId: student.id,
                    date: date,
                    status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
                    markedById: allTeachers[Math.floor(Math.random() * allTeachers.length)].id,
                    remarks: i === 0 ? 'Regular attendance' : null
                }
            });
        }

        // Create 3 grades per student
        const subjects = ['Mathematics', 'Science', 'English'];
        for (const sub of subjects) {
            await prisma.academicGrade.create({
                data: {
                    studentId: student.id,
                    subject: sub,
                    score: 75 + Math.floor(Math.random() * 20),
                    maxScore: 100,
                    grade: 'A',
                    term: 'Mid-Term',
                    academicYear: '2024-25',
                    enteredById: allTeachers[Math.floor(Math.random() * allTeachers.length)].id
                }
            });
        }
    }

    // ============================================
    // NOTICES (School-wide)
    // ============================================
    console.log('📢 Seeding Notifications...');
    await prisma.notice.createMany({
        data: [
            {
                title: 'Republic Day Celebration',
                message: 'Republic Day will be celebrated on 26th January. Attendance is mandatory for all students and staff.',
                target: 'ALL',
                date: new Date('2026-01-20'),
                author: 'Principal Office',
                type: NoticeType.EVENT,
                priority: NoticePriority.HIGH,
                createdById: adminUser.id,
                expiresAt: new Date('2026-01-27'),
            },
            {
                title: 'Mid-Term Exam Schedule',
                message: 'The Mid-Term examination schedule for Term 1 (2025-26) has been updated. Please check the notice board or student portal.',
                target: 'STUDENTS',
                date: new Date(),
                author: 'Examination Cell',
                type: NoticeType.EXAM,
                priority: NoticePriority.URGENT,
                createdById: adminUser.id,
                expiresAt: new Date('2026-03-30'),
            },
            {
                title: 'Sports Day Registration',
                message: 'Registration for Annual Sports Day is now open. Interested students can register with their physical education teachers.',
                target: 'STUDENTS',
                date: new Date(),
                author: 'Sports Dept',
                type: NoticeType.EVENT,
                priority: NoticePriority.NORMAL,
                createdById: adminUser.id,
                expiresAt: new Date('2026-02-15'),
            },
            {
                title: 'Library Reminder',
                message: 'All borrowed books from the library must be returned by the end of this month to avoid fines.',
                target: 'STUDENTS',
                date: new Date(),
                author: 'Librarian',
                type: NoticeType.GENERAL,
                priority: NoticePriority.LOW,
                createdById: adminUser.id,
                expiresAt: new Date('2026-01-31'),
            }
        ]
    });

    // ============================================
    // TIMETABLE (Class 10-A, 1-B, etc.)
    // ============================================
    console.log('⏰ Seeding Timetable...');
    const timetableData = [
        // 10-A - Monday
        { class: '10', section: 'A', day: 'MON', period: 1, time: '8:00-8:40', subject: 'MAT', teacher: 'Devi', type: 'CLASS' },
        { class: '10', section: 'A', day: 'MON', period: 2, time: '8:40-9:20', subject: 'ENG', teacher: 'Pandey', type: 'CLASS' },
        { class: '10', section: 'A', day: 'MON', period: 3, time: '9:30-10:10', subject: 'SCI', teacher: 'Yadav', type: 'CLASS' },
        { class: '10', section: 'A', day: 'MON', period: 4, time: '10:10-10:50', subject: 'MOR', teacher: 'Jha', type: 'CLASS' },
        { class: '10', section: 'A', day: 'MON', period: 5, time: '10:50-11:30', subject: 'ART', teacher: 'Rawat', type: 'CLASS' },
        { class: '10', section: 'A', day: 'MON', period: 6, time: '12:10-12:50', subject: 'PE', teacher: 'Chauhan', type: 'CLASS' },
        { class: '10', section: 'A', day: 'MON', period: 7, time: '12:50-1:30', subject: 'MUS', teacher: 'Gupta', type: 'CLASS' },
        { class: '10', section: 'A', day: 'MON', period: 8, time: '1:40-2:20', subject: 'CS', teacher: 'Sinha', type: 'CLASS' },

        // 10-A - Tuesday
        { class: '10', section: 'A', day: 'TUE', period: 1, time: '8:00-8:40', subject: 'SCI', teacher: 'Mishra', type: 'CLASS' },
        { class: '10', section: 'A', day: 'TUE', period: 2, time: '8:40-9:20', subject: 'HIN', teacher: 'Jha', type: 'CLASS' },
        { class: '10', section: 'A', day: 'TUE', period: 3, time: '9:30-10:10', subject: 'ENG', teacher: 'Agarwal', type: 'CLASS' },
        { class: '10', section: 'A', day: 'TUE', period: 4, time: '10:10-10:50', subject: 'MAT', teacher: 'Devi', type: 'CLASS' },
        { class: '10', section: 'A', day: 'TUE', period: 5, time: '10:50-11:30', subject: 'MUS', teacher: 'Gupta', type: 'CLASS' },
        { class: '10', section: 'A', day: 'TUE', period: 6, time: '12:10-12:50', subject: 'FREE', teacher: '-', type: 'CLASS' },
        { class: '10', section: 'A', day: 'TUE', period: 7, time: '12:50-1:30', subject: 'SST', teacher: 'Verma', type: 'CLASS' },
        { class: '10', section: 'A', day: 'TUE', period: 8, time: '1:40-2:20', subject: 'SST', teacher: 'Verma', type: 'CLASS' },

        // 1-A (for other students)
        { class: '1', section: 'A', day: 'MON', period: 1, time: '8:00-8:40', subject: 'MAT', teacher: 'Iyer', type: 'CLASS' },
        { class: '1', section: 'A', day: 'MON', period: 2, time: '8:40-9:20', subject: 'ENG', teacher: 'Kumar', type: 'CLASS' },
        { class: '1', section: 'A', day: 'MON', period: 3, time: '9:30-10:10', subject: 'HIN', teacher: 'Jha', type: 'CLASS' },
    ];

    for (const item of timetableData) {
        await prisma.timetable.create({
            data: {
                class: item.class,
                section: item.section,
                dayOfWeek: item.day,
                period: item.period,
                periodTime: item.time,
                subject: item.subject,
                teacherName: item.teacher,
                type: item.type,
            }
        });
    }

    // Add common breaks for everything
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (const d of days) {
        await prisma.timetable.create({
            data: { class: 'ALL', section: 'ALL', dayOfWeek: d, period: 0, periodTime: '9:20-9:30', subject: 'BREAK', teacherName: '-', type: 'BREAK' }
        });
        await prisma.timetable.create({
            data: { class: 'ALL', section: 'ALL', dayOfWeek: d, period: 99, periodTime: '11:30-12:10', subject: 'LUNCH', teacherName: '-', type: 'BREAK' }
        });
    }

    // ============================================
    // TRANSPORT MANAGEMENT SEED DATA
    // ============================================
    console.log('🚌 Seeding Transport System...');

    // --- DRIVERS ---
    const driver1 = await prisma.driver.create({
        data: {
            name: 'Ravi Kumar',
            phone: '9876500001',
            licenseNo: 'KA01-DL-2020-001',
            licenseExpiry: new Date('2027-06-15'),
            medicalExpiry: new Date('2026-12-01'),
            policeVerified: true,
        }
    });
    const driver2 = await prisma.driver.create({
        data: {
            name: 'Sunil Yadav',
            phone: '9876500002',
            licenseNo: 'KA01-DL-2019-042',
            licenseExpiry: new Date('2026-11-30'),
            medicalExpiry: new Date('2026-08-15'),
            policeVerified: true,
        }
    });
    const driver3 = await prisma.driver.create({
        data: {
            name: 'Manoj Pillai',
            phone: '9876500003',
            licenseNo: 'KA01-DL-2021-078',
            licenseExpiry: new Date('2028-03-20'),
            medicalExpiry: new Date('2027-01-10'),
            policeVerified: true,
        }
    });
    console.log('✅ 3 Drivers created');

    // --- VEHICLES ---
    const vehicle1 = await prisma.vehicle.create({
        data: {
            registrationNo: 'KA-01-AB-1234',
            type: VehicleType.BUS,
            capacity: 45,
            manufacturer: 'Tata',
            model: 'Starbus',
            year: 2022,
            insuranceNo: 'INS-2024-001',
            insuranceExpiry: new Date('2026-09-30'),
            permitExpiry: new Date('2027-03-31'),
            fitnessExpiry: new Date('2026-06-30'),
            gpsDeviceId: 'GPS-001',
            fuelType: FuelType.DIESEL,
            odometerReading: 45200,
            lastServiceDate: new Date('2026-02-15'),
            status: VehicleStatus.ACTIVE,
            driverId: driver1.id,
        }
    });
    const vehicle2 = await prisma.vehicle.create({
        data: {
            registrationNo: 'KA-01-CD-5678',
            type: VehicleType.BUS,
            capacity: 40,
            manufacturer: 'Ashok Leyland',
            model: 'Lynx',
            year: 2023,
            insuranceNo: 'INS-2024-002',
            insuranceExpiry: new Date('2026-12-15'),
            permitExpiry: new Date('2027-06-30'),
            fitnessExpiry: new Date('2026-09-15'),
            gpsDeviceId: 'GPS-002',
            fuelType: FuelType.CNG,
            odometerReading: 28500,
            lastServiceDate: new Date('2026-03-01'),
            status: VehicleStatus.ACTIVE,
            driverId: driver2.id,
        }
    });
    const vehicle3 = await prisma.vehicle.create({
        data: {
            registrationNo: 'KA-01-EF-9012',
            type: VehicleType.VAN,
            capacity: 15,
            manufacturer: 'Force',
            model: 'Traveller',
            year: 2021,
            insuranceNo: 'INS-2024-003',
            insuranceExpiry: new Date('2026-08-01'),
            permitExpiry: new Date('2026-12-31'),
            fitnessExpiry: new Date('2026-05-15'),
            gpsDeviceId: 'GPS-003',
            fuelType: FuelType.DIESEL,
            odometerReading: 62100,
            lastServiceDate: new Date('2026-01-20'),
            status: VehicleStatus.ACTIVE,
            driverId: driver3.id,
        }
    });
    console.log('✅ 3 Vehicles created');

    // --- ROUTES & STOPS ---
    const route1 = await prisma.route.create({
        data: {
            name: 'Route A — Jayanagar',
            vehicleId: vehicle1.id,
            stops: {
                create: [
                    { stopName: 'Jayanagar 4th Block', landmark: 'Near Cool Joint', latitude: 12.9266, longitude: 77.5816, sequence: 1, morningArrival: '7:00 AM', eveningArrival: '3:45 PM' },
                    { stopName: 'JP Nagar Phase 1', landmark: 'Opp. BDA Complex', latitude: 12.9078, longitude: 77.5859, sequence: 2, morningArrival: '7:15 AM', eveningArrival: '4:00 PM' },
                    { stopName: 'Banashankari Circle', landmark: 'Near ISKCON', latitude: 12.9248, longitude: 77.5468, sequence: 3, morningArrival: '7:30 AM', eveningArrival: '4:15 PM' },
                    { stopName: 'Kumaraswamy Layout', landmark: 'Metro Station', latitude: 12.9012, longitude: 77.5588, sequence: 4, morningArrival: '7:40 AM', eveningArrival: '4:30 PM' },
                    { stopName: 'School Gate', landmark: 'Charronix School', latitude: 12.9352, longitude: 77.6245, sequence: 5, morningArrival: '8:00 AM', eveningArrival: '3:30 PM' },
                ]
            }
        },
        include: { stops: true }
    });

    const route2 = await prisma.route.create({
        data: {
            name: 'Route B — Koramangala',
            vehicleId: vehicle2.id,
            stops: {
                create: [
                    { stopName: 'Koramangala 5th Block', landmark: 'Near Forum Mall', latitude: 12.9352, longitude: 77.6245, sequence: 1, morningArrival: '7:05 AM', eveningArrival: '3:50 PM' },
                    { stopName: 'Madiwala', landmark: 'Silk Board Junction', latitude: 12.9121, longitude: 77.6232, sequence: 2, morningArrival: '7:20 AM', eveningArrival: '4:05 PM' },
                    { stopName: 'HSR Layout Sector 1', landmark: 'Near BDA Park', latitude: 12.9116, longitude: 77.6389, sequence: 3, morningArrival: '7:30 AM', eveningArrival: '4:15 PM' },
                    { stopName: 'BTM Layout 2nd Stage', landmark: 'Near Udupi Garden', latitude: 12.9166, longitude: 77.6101, sequence: 4, morningArrival: '7:40 AM', eveningArrival: '4:25 PM' },
                    { stopName: 'School Gate', landmark: 'Charronix School', latitude: 12.9352, longitude: 77.6245, sequence: 5, morningArrival: '7:55 AM', eveningArrival: '3:30 PM' },
                ]
            }
        },
        include: { stops: true }
    });

    const route3 = await prisma.route.create({
        data: {
            name: 'Route C — Whitefield',
            vehicleId: vehicle3.id,
            stops: {
                create: [
                    { stopName: 'Whitefield Main Road', landmark: 'Near Prestige Shantiniketan', latitude: 12.9698, longitude: 77.7500, sequence: 1, morningArrival: '6:50 AM', eveningArrival: '4:00 PM' },
                    { stopName: 'Marathahalli Bridge', landmark: 'Near Innovative Multiplex', latitude: 12.9591, longitude: 77.6972, sequence: 2, morningArrival: '7:10 AM', eveningArrival: '4:15 PM' },
                    { stopName: 'Indiranagar 100ft Road', landmark: 'Near CMH Road', latitude: 12.9784, longitude: 77.6408, sequence: 3, morningArrival: '7:30 AM', eveningArrival: '4:30 PM' },
                    { stopName: 'School Gate', landmark: 'Charronix School', latitude: 12.9352, longitude: 77.6245, sequence: 4, morningArrival: '7:50 AM', eveningArrival: '3:30 PM' },
                ]
            }
        },
        include: { stops: true }
    });
    console.log('✅ 3 Routes with stops created');

    // --- ASSIGN STUDENTS TO ROUTES ---
    const transportStudents = await prisma.student.findMany({ take: 15 });
    const routeConfigs = [
        { route: route1, stops: route1.stops, vehicle: vehicle1 },
        { route: route2, stops: route2.stops, vehicle: vehicle2 },
        { route: route3, stops: route3.stops, vehicle: vehicle3 },
    ];

    for (let i = 0; i < transportStudents.length; i++) {
        const s = transportStudents[i];
        const rConfig = routeConfigs[i % 3];
        const availableStops = rConfig.stops.filter((st: any) => st.stopName !== 'School Gate');
        const assignedStop = availableStops[i % availableStops.length];
        const feeSlabs = [1000, 1200, 1500, 1800, 2000];

        await prisma.studentTransport.create({
            data: {
                studentId: s.id,
                routeId: rConfig.route.id,
                stopId: assignedStop.id,
                qrCode: `ST-${s.id.substring(0, 8)}-${Date.now()}-${i}`,
                feeAmount: feeSlabs[i % feeSlabs.length],
                pickupType: PickupType.BOTH,
            }
        });
    }
    console.log(`✅ ${transportStudents.length} students assigned to transport routes`);

    // --- BOARDING LOGS (today + recent) ---
    const now = new Date();
    const boardingStudents = transportStudents.slice(0, 10);
    for (let i = 0; i < boardingStudents.length; i++) {
        const s = boardingStudents[i];
        const rConfig = routeConfigs[i % 3];
        const availableStops = rConfig.stops.filter((st: any) => st.stopName !== 'School Gate');
        const stop = availableStops[i % availableStops.length];

        // Today morning boarding
        const morningTime = new Date(now);
        morningTime.setHours(7, 15 + (i * 3), 0, 0);
        await prisma.boardingLog.create({
            data: {
                studentId: s.id,
                vehicleId: rConfig.vehicle.id,
                stopId: stop.id,
                timestamp: morningTime,
                type: BoardingType.BOARDING,
                scanMethod: i % 2 === 0 ? ScanMethod.QR_CODE : ScanMethod.MANUAL,
            }
        });

        // Yesterday boarding + deboarding
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(7, 10 + (i * 2), 0, 0);
        await prisma.boardingLog.create({
            data: {
                studentId: s.id,
                vehicleId: rConfig.vehicle.id,
                stopId: stop.id,
                timestamp: yesterday,
                type: BoardingType.BOARDING,
                scanMethod: ScanMethod.QR_CODE,
            }
        });
        const yesterdayEvening = new Date(now);
        yesterdayEvening.setDate(yesterdayEvening.getDate() - 1);
        yesterdayEvening.setHours(15, 30 + (i * 2), 0, 0);
        await prisma.boardingLog.create({
            data: {
                studentId: s.id,
                vehicleId: rConfig.vehicle.id,
                stopId: stop.id,
                timestamp: yesterdayEvening,
                type: BoardingType.DEBOARDING,
                scanMethod: ScanMethod.MANUAL,
            }
        });
    }
    console.log(`✅ ${boardingStudents.length * 3} boarding log entries created`);

    // ============================================
    // SYSTEM SETTINGS
    // ============================================
    const settings = [
        { key: 'school_name', value: 'Charronix Model School', category: 'SCHOOL' as const },
        { key: 'academic_year', value: '2024-25', category: 'SCHOOL' as const }
    ];

    for (const s of settings) {
        await prisma.systemSetting.create({
            data: { ...s, updatedBy: adminUser.id }
        });
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`   - Principal: 1 (900001)`);
    console.log(`   - Teachers: ${teacherNames.length} (100001-100030)`);
    console.log(`   - Students: 100 (24BIT0522-24BIT0621)`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
