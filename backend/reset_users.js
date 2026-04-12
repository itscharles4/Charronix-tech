"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const newPassword = await bcrypt_1.default.hash('admin123', 12);
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
//# sourceMappingURL=reset_users.js.map