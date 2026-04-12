"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcrypt_1.default.hash('Admin@1234', 12);
    const teacherPassword = await bcrypt_1.default.hash('Teacher@1234', 12);
    const studentPassword = await bcrypt_1.default.hash('Student@1234', 12);
    await prisma.user.update({
        where: { email: 'admin@charronix.edu' },
        data: { passwordHash: adminPassword, loginAttempts: 0, lockedUntil: null }
    });
    await prisma.user.updateMany({
        where: { email: { in: ['meera.iyer@charronix.edu', 'rajesh.kumar@charronix.edu'] } },
        data: { passwordHash: teacherPassword, loginAttempts: 0, lockedUntil: null }
    });
    await prisma.user.updateMany({
        where: { email: { in: ['aarav.sharma@student.charronix.edu', 'priya.patel@student.charronix.edu'] } },
        data: { passwordHash: studentPassword, loginAttempts: 0, lockedUntil: null }
    });
    console.log('✅ All key users reverted to ORIGINAL passwords and lockouts cleared.');
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=true_revert.js.map