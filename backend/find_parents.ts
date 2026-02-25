import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- PARENT USERS ---');
    const parents = await prisma.user.findMany({
        where: { role: Role.PARENT },
        select: { loginId: true, email: true }
    });
    console.log(JSON.stringify(parents, null, 2));
    console.log('--------------------');
}
main().catch(console.error).finally(() => prisma.$disconnect());
