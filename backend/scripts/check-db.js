const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const [vehicles, routes, students, drivers, logs] = await Promise.all([
            prisma.vehicle.count(),
            prisma.route.count(),
            prisma.studentTransport.count(),
            prisma.driver.count(),
            prisma.boardingLog.count(),
        ]);
        console.log('--- DATABASE COUNTS ---');
        console.log('Vehicles:', vehicles);
        console.log('Routes:', routes);
        console.log('Student Transport Assignments:', students);
        console.log('Drivers:', drivers);
        console.log('Boarding Logs:', logs);
        console.log('-----------------------');
    } catch (err) {
        console.error('Error fetching counts:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
