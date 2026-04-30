const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

async function fixAndCreate() {
    const client = await MongoClient.connect('mongodb://localhost:27017/charronix_db?replicaSet=rs0&directConnection=true');
    const db = client.db();

    // Generate CORRECT password hash
    const correctHash = await bcrypt.hash('Student@1234', 12);
    console.log('Generated correct hash for Student@1234');

    // Fix existing manually inserted users
    const manualIds = ['24BIT0700', '24BIT0800', '24BIT0801'];
    for (const lid of manualIds) {
        const result = await db.collection('users').updateOne(
            { login_id: lid },
            { $set: { password_hash: correctHash } }
        );
        if (result.modifiedCount > 0) {
            console.log('✅ Fixed password for', lid);
        }
    }

    // Now create a DEMO student for the teacher presentation
    // First clean up if exists
    await db.collection('users').deleteMany({ login_id: '24BIT0900' });
    await db.collection('students').deleteMany({ admission_no: 'ADM2026900' });

    const uid = uuidv4();
    const sid = uuidv4();
    const demoHash = await bcrypt.hash('Student@1234', 12);

    await db.collection('users').insertOne({
        _id: uid,
        email: 'demo.student@student.charronix.edu',
        password_hash: demoHash,
        role: 'STUDENT',
        login_id: '24BIT0900',
        is_active: true,
        failed_login_attempts: 0,
        created_at: new Date(),
        updated_at: new Date()
    });

    await db.collection('students').insertOne({
        _id: sid,
        user_id: uid,
        admission_no: 'ADM2026900',
        first_name: 'Demo',
        last_name: 'Student',
        date_of_birth: new Date('2011-06-15'),
        gender: 'MALE',
        class: '10',
        section: 'A',
        roll_no: 50,
        parent_name: 'Demo Parents',
        parent_phone: '9999999999',
        parent_email: 'demo.parents@email.com',
        blood_group: 'A+',
        status: 'ACTIVE',
        total_present: 0,
        total_absent: 0,
        attendance_percentage: 0,
        created_at: new Date(),
        updated_at: new Date()
    });

    console.log('\n✅ Demo Student created!');
    console.log('   Login ID: 24BIT0900');
    console.log('   Password: Student@1234');
    console.log('   Name: Demo Student');
    console.log('   Total students:', await db.collection('students').countDocuments());

    // Verify login works
    const verify = await db.collection('users').findOne({ login_id: '24BIT0900' });
    const matches = await bcrypt.compare('Student@1234', verify.password_hash);
    console.log('   Password verification:', matches ? '✅ CORRECT' : '❌ WRONG');

    await client.close();
}

fixAndCreate();
