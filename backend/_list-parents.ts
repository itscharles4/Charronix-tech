import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Get all parent users
    const parents = await prisma.user.findMany({
        where: { role: 'PARENT' },
        select: { loginId: true, email: true },
        orderBy: { loginId: 'asc' },
    });

    // Get all students to map children to parents
    const students = await prisma.student.findMany({
        select: { firstName: true, lastName: true, admissionNo: true, parentEmail: true, class: true, section: true },
        orderBy: [{ class: 'asc' }, { section: 'asc' }],
    });

    // Build parent-to-children map
    const childrenMap = new Map<string, string[]>();
    for (const s of students) {
        if (!s.parentEmail) continue;
        const existing = childrenMap.get(s.parentEmail) || [];
        existing.push(`${s.firstName} ${s.lastName} (${s.admissionNo}, ${s.class}-${s.section})`);
        childrenMap.set(s.parentEmail, existing);
    }

    // Write results to a file for easy reading
    const lines: string[] = [];
    lines.push('# PARENT LOGIN CREDENTIALS');
    lines.push(`# Total: ${parents.length} accounts`);
    lines.push('# Default Password: Parent@1234');
    lines.push('');
    lines.push('| # | Login ID | Email | Children |');
    lines.push('|---|----------|-------|----------|');

    parents.forEach((p, i) => {
        const children = childrenMap.get(p.email) || ['Unknown'];
        lines.push(`| ${i + 1} | ${p.loginId} | ${p.email} | ${children.join('; ')} |`);
    });

    // Write to file
    const fs = require('fs');
    fs.writeFileSync('../PARENT_CREDENTIALS.md', lines.join('\n'));
    console.log(`Wrote ${parents.length} parent credentials to PARENT_CREDENTIALS.md`);
}

main()
    .catch(console.error)
    .finally(async () => { await prisma.$disconnect(); });
