import { PrismaClient, Role } from '../src/generated/client';

const prisma = new PrismaClient();

const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'History', 'Geography', 'Social Studies', 'Computer Science', 
    'Art', 'Physical Education', 'Economics', 'Accountancy'
];

async function main() {
    console.log('🚀 Starting Timetable & Transport Population...');

    // 1. Get all students to identify classes/sections
    const students = await prisma.student.findMany({
        select: { class: true, section: true }
    });
    
    const uniqueClasses = Array.from(new Set(students.map(s => s.class)));
    const uniqueSections = Array.from(new Set(students.map(s => s.section)));
    
    console.log(`Found ${uniqueClasses.length} classes and ${uniqueSections.length} sections.`);

    // 2. Get all teachers
    const teachers = await prisma.teacher.findMany();
    if (teachers.length === 0) {
        console.error('❌ No teachers found! Cannot assign to timetable.');
        return;
    }

    // 3. Clear existing timetable
    console.log('🗑️ Clearing existing timetable...');
    await prisma.timetable.deleteMany();

    // 4. Generate timetable entries
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const periods = [
        { p: 1, time: '8:00-8:40' },
        { p: 2, time: '8:40-9:20' },
        { p: 3, time: '9:30-10:10' },
        { p: 4, time: '10:10-10:50' },
        { p: 5, time: '10:50-11:30' },
        { p: 6, time: '12:10-12:50' },
        { p: 7, time: '12:50-1:30' },
        { p: 8, time: '1:40-2:20' },
    ];

    console.log('📅 Generating entries for each class and section...');
    let count = 0;
    for (const className of uniqueClasses) {
        for (const section of uniqueSections) {
            for (const day of days) {
                for (const period of periods) {
                    const subject = subjects[Math.floor(Math.random() * subjects.length)];
                    const teacher = teachers[Math.floor(Math.random() * teachers.length)];
                    
                    await prisma.timetable.create({
                        data: {
                            class: className,
                            section: section,
                            dayOfWeek: day,
                            period: period.p,
                            periodTime: period.time,
                            subject: subject.substring(0, 3).toUpperCase(), // Short code like MAT, ENG
                            teacherName: `${teacher.firstName} ${teacher.lastName}`,
                            type: 'CLASS'
                        }
                    });
                    count++;
                }
            }
        }
    }
    console.log(`✅ Created ${count} timetable entries.`);

    // 5. Ensure Transport is Active
    console.log('🚌 Ensuring Transport routes are active...');
    await prisma.route.updateMany({
        data: { isActive: true }
    });
    
    const routeCount = await prisma.route.count();
    const vehicleCount = await prisma.vehicle.count();
    console.log(`✅ Transport Status: ${vehicleCount} vehicles, ${routeCount} active routes.`);
}

main()
    .catch(e => {
        console.error('❌ Population failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
