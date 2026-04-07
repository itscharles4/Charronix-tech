import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const counts = {
            vehicles: await prisma.vehicle.count(),
            routes: await prisma.route.count(),
            drivers: await prisma.driver.count(),
            studentTransports: await prisma.studentTransport.count(),
            boardingLogs: await prisma.boardingLog.count(),
            students: await prisma.student.count(),
            timetables: await prisma.timetable.count(),
        };
        console.log('--- DATABASE STATUS ---');
        console.log(JSON.stringify(counts, null, 2));
        console.log('-----------------------');
    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
