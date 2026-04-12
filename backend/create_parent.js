"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Creating Parent Account...');
    const email = 'parent.tara603@example.com';
    const loginId = '800001';
    const password = 'Parent@1234';
    const hashedPassword = await bcrypt_1.default.hash(password, 12);
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: client_1.Role.PARENT,
            loginId,
            isActive: true,
        },
        create: {
            email,
            passwordHash: hashedPassword,
            role: client_1.Role.PARENT,
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
//# sourceMappingURL=create_parent.js.map