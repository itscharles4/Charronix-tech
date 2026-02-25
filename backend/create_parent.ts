import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating Parent Account...');

    const email = 'parent.tara603@example.com';
    const loginId = '800001';
    const password = 'Parent@1234';
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: Role.PARENT,
            loginId,
            isActive: true,
        },
        create: {
            email,
            passwordHash: hashedPassword,
            role: Role.PARENT,
            loginId,
            isActive: true,
        },
    });

    console.log(`✅ Parent account created/updated:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Login ID: ${user.loginId}`);
    console.log(`   Password: ${password}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
