
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    const teacherPassword = await bcrypt.hash('Teacher@1234', 12);
    const studentPassword = await bcrypt.hash('Student@1234', 12);

    // Revert Admin
    await prisma.user.update({
        where: { email: 'admin@charronix.edu' },
        data: { passwordHash: adminPassword, loginAttempts: 0, lockedUntil: null }
    });

    // Revert Teachers
    await prisma.user.updateMany({
        where: { email: { in: ['meera.iyer@charronix.edu', 'rajesh.kumar@charronix.edu'] } },
        data: { passwordHash: teacherPassword, loginAttempts: 0, lockedUntil: null }
    });

    // Revert Students (Aarav and Priya)
    await prisma.user.updateMany({
        where: { email: { in: ['aarav.sharma@student.charronix.edu', 'priya.patel@student.charronix.edu'] } },
        data: { passwordHash: studentPassword, loginAttempts: 0, lockedUntil: null }
    });

    console.log('✅ All key users reverted to ORIGINAL passwords and lockouts cleared.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
