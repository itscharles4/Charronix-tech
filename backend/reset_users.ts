
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const newPassword = await bcrypt.hash('admin123', 12);

    await prisma.user.updateMany({
        data: {
            passwordHash: newPassword,
            loginAttempts: 0,
            lockedUntil: null,
            isActive: true
        }
    });

    console.log('✅ All users reset:');
    console.log('   Email: (use seed emails)');
    console.log('   Password: admin123');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
