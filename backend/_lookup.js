"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./src/config/database"));
async function main() {
    const s = await database_1.default.student.findFirst({
        where: { admissionNo: 'ADM2024543' },
        select: { firstName: true, lastName: true, parentEmail: true, parentPhone: true, parentName: true }
    });
    console.log('Student:', JSON.stringify(s, null, 2));
    if (s?.parentEmail) {
        const u = await database_1.default.user.findFirst({
            where: { email: s.parentEmail },
            select: { id: true, email: true, role: true }
        });
        console.log('Parent User:', JSON.stringify(u, null, 2));
    }
    else {
        const allParents = await database_1.default.user.findMany({
            where: { role: 'PARENT' },
            select: { id: true, email: true, role: true },
            take: 10
        });
        console.log('All Parent Users (first 10):', JSON.stringify(allParents, null, 2));
    }
    await database_1.default.$disconnect();
}
main();
//# sourceMappingURL=_lookup.js.map