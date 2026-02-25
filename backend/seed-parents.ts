import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('👨‍👩‍👧 Seeding Parent User Accounts...\n');

    const hashedPasswordParent = await bcrypt.hash('Parent@1234', 12);

    // Get all students with parentEmail
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

    // Group students by parentEmail to handle siblings
    const parentMap = new Map<string, typeof students>();
    for (const student of students) {
        if (!student.parentEmail) continue;
        const existing = parentMap.get(student.parentEmail) || [];
        existing.push(student);
        parentMap.set(student.parentEmail, existing);
    }

    console.log(`Found ${students.length} students with ${parentMap.size} unique parent emails.\n`);

    let counter = 1;
    const results: { loginId: string; email: string; password: string; parentName: string; children: string[] }[] = [];

    for (const [email, children] of parentMap) {
        // Skip if parent user already exists
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
                role: Role.PARENT,
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

    // Print summary table
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
