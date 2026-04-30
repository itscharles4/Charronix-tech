import { PrismaClient } from './src/generated/client';
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.studentTransport.count();
    const withQr = await prisma.studentTransport.count({ where: { NOT: { qrCode: null } } });
    const samples = await prisma.studentTransport.findMany({
        select: {
            qrCode: true,
            student: { select: { firstName: true, lastName: true, admissionNo: true } },
        },
        take: 5,
    });
    console.log(`Total transport assignments: ${total}`);
    console.log(`Assignments WITH QR code: ${withQr}`);
    console.log(`Assignments WITHOUT QR code: ${total - withQr}`);
    console.log('\nSample QR codes:');
    for (const s of samples) {
        console.log(`  ${s.student?.firstName} ${s.student?.lastName} (${s.student?.admissionNo}) → qrCode: ${s.qrCode}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
