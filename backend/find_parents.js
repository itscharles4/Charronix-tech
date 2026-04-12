"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- PARENT USERS ---');
    const parents = await prisma.user.findMany({
        where: { role: client_1.Role.PARENT },
        select: { loginId: true, email: true }
    });
    console.log(JSON.stringify(parents, null, 2));
    console.log('--------------------');
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=find_parents.js.map