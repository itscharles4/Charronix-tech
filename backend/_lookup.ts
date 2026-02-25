import prisma from './src/config/database';

async function main() {
    const s = await prisma.student.findFirst({
        where: { admissionNo: 'ADM2024543' },
        select: { firstName: true, lastName: true, parentEmail: true, parentPhone: true, parentName: true }
    });
    console.log('Student:', JSON.stringify(s, null, 2));

    if (s?.parentEmail) {
        const u = await prisma.user.findFirst({
            where: { email: s.parentEmail },
            select: { id: true, email: true, role: true }
        });
        console.log('Parent User:', JSON.stringify(u, null, 2));
    } else {
        // Try finding parent by phone or by linked records
        const allParents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            select: { id: true, email: true, role: true },
            take: 10
        });
        console.log('All Parent Users (first 10):', JSON.stringify(allParents, null, 2));
    }

    await prisma.$disconnect();
}
main();
