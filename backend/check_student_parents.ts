import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- STUDENT PARENT EMAILS ---');
    const students = await prisma.student.findMany({
        take: 5,
        select: { firstName: true, lastName: true, parentEmail: true, parentName: true }
    });
    console.log(JSON.stringify(students, null, 2));
    console.log('------------------------------');
}
main().catch(console.error).finally(() => prisma.$disconnect());
