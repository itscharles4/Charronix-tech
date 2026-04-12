"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('👨‍👩‍👧 Seeding Parent User Accounts...\n');
    const hashedPasswordParent = await bcrypt_1.default.hash('Parent@1234', 12);
    const students = await prisma.student.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
            parentEmail: true,
            parentName: true,
            parentPhone: true,
            class: true,
            section: true,
        },
        orderBy: [{ class: 'asc' }, { section: 'asc' }, { rollNo: 'asc' }],
    });
    const parentMap = new Map();
    for (const student of students) {
        if (!student.parentEmail)
            continue;
        const existing = parentMap.get(student.parentEmail) || [];
        existing.push(student);
        parentMap.set(student.parentEmail, existing);
    }
    console.log(`Found ${students.length} students with ${parentMap.size} unique parent emails.\n`);
    let counter = 1;
    const results = [];
    for (const [email, children] of parentMap) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log(`⏩ Parent ${email} already exists (loginId: ${existingUser.loginId})`);
            results.push({
                loginId: existingUser.loginId || 'N/A',
                email,
                password: 'Parent@1234',
                parentName: children[0].parentName,
                children: children.map(c => `${c.firstName} ${c.lastName} (${c.admissionNo}, ${c.class}-${c.section})`),
            });
            counter++;
            continue;
        }
        const loginId = `${200000 + counter}`;
        await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPasswordParent,
                role: client_1.Role.PARENT,
                loginId,
                isActive: true,
            },
        });
        results.push({
            loginId,
            email,
            password: 'Parent@1234',
            parentName: children[0].parentName,
            children: children.map(c => `${c.firstName} ${c.lastName} (${c.admissionNo}, ${c.class}-${c.section})`),
        });
        console.log(`✅ Parent ${counter}: ${children[0].parentName} | loginId: ${loginId} | email: ${email} | children: ${children.map(c => c.firstName).join(', ')}`);
        counter++;
    }
    console.log('\n\n====================================================');
    console.log('          PARENT LOGIN CREDENTIALS SUMMARY');
    console.log('====================================================\n');
    console.log('Login ID  | Password      | Parent Name         | Children');
    console.log('----------|---------------|---------------------|----------------------------');
    for (const r of results) {
        const childStr = r.children.join('; ');
        console.log(`${r.loginId.padEnd(10)}| Parent@1234   | ${r.parentName.padEnd(20)}| ${childStr}`);
    }
    console.log(`\n✅ Total parent accounts created/verified: ${results.length}`);
    console.log('🔐 Default password for all parents: Parent@1234');
}
main()
    .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-parents.js.map