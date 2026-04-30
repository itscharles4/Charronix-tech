/**
 * DEMO HELPER: Generates exact mongosh commands for inserting/deleting students
 * 
 * Usage: 
 *   node demo-helper.js insert "Rahul" "Mehra" "24BIT1001"
 *   node demo-helper.js delete "24BIT1001"
 *   node demo-helper.js show
 */
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function main() {
    const action = process.argv[2] || 'insert';

    if (action === 'insert') {
        const firstName = process.argv[3] || 'Rahul';
        const lastName = process.argv[4] || 'Mehra';
        const loginId = process.argv[5] || '24BIT1001';
        const admNo = 'ADM' + loginId.replace('24BIT', '2026');

        const uid = uuidv4();
        const sid = uuidv4();
        const hash = await bcrypt.hash('Student@1234', 12);

        console.log('');
        console.log('='.repeat(70));
        console.log('  COPY-PASTE THESE COMMANDS INTO MONGOSH (one by one)');
        console.log('='.repeat(70));
        console.log('');
        console.log('// Step 1: Insert user account');
        console.log(`db.users.insertOne({ _id: "${uid}", email: "${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.charronix.edu", password_hash: "${hash}", role: "STUDENT", login_id: "${loginId}", is_active: true, failed_login_attempts: 0, created_at: new Date(), updated_at: new Date() })`);
        console.log('');
        console.log('// Step 2: Insert student record');
        console.log(`db.students.insertOne({ _id: "${sid}", user_id: "${uid}", admission_no: "${admNo}", first_name: "${firstName}", last_name: "${lastName}", date_of_birth: new Date("2010-05-15"), gender: "MALE", class: "10", section: "A", roll_no: 50, parent_name: "${lastName} Parents", parent_phone: "9876543210", parent_email: "${firstName.toLowerCase()}.parent@email.com", status: "ACTIVE", total_present: 0, total_absent: 0, attendance_percentage: 0, created_at: new Date(), updated_at: new Date() })`);
        console.log('');
        console.log('// Step 3: Verify student was added');
        console.log(`db.students.findOne({ admission_no: "${admNo}" })`);
        console.log('');
        console.log('// Step 4: Count total students');
        console.log('db.students.countDocuments()');
        console.log('');
        console.log('='.repeat(70));
        console.log(`  LOGIN: ${loginId} / Student@1234`);
        console.log('='.repeat(70));
        console.log('');
    }

    if (action === 'delete') {
        const loginId = process.argv[3] || '24BIT1001';
        const admNo = 'ADM' + loginId.replace('24BIT', '2026');

        console.log('');
        console.log('='.repeat(70));
        console.log('  COPY-PASTE THESE COMMANDS INTO MONGOSH (one by one)');
        console.log('='.repeat(70));
        console.log('');
        console.log('// Step 1: Find the student');
        console.log(`var s = db.students.findOne({ admission_no: "${admNo}" })`);
        console.log('');
        console.log('// Step 2: Delete student record');
        console.log(`db.students.deleteOne({ admission_no: "${admNo}" })`);
        console.log('');
        console.log('// Step 3: Delete user account');
        console.log(`db.users.deleteOne({ login_id: "${loginId}" })`);
        console.log('');
        console.log('// Step 4: Verify deletion');
        console.log('db.students.countDocuments()');
        console.log('');
    }

    if (action === 'show') {
        console.log('');
        console.log('// Show all students');
        console.log('db.students.find({}, { first_name:1, last_name:1, class:1, section:1, admission_no:1, status:1 }).sort({ admission_no: 1 })');
        console.log('');
        console.log('// Count students');
        console.log('db.students.countDocuments()');
        console.log('');
        console.log('// Find specific student');
        console.log('db.students.findOne({ first_name: "Rahul" })');
        console.log('');
    }
}

main();
