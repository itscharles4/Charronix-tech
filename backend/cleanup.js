// Cleanup script - removes students with invalid (non-UUID) _id values
const { MongoClient } = require('mongodb');

async function cleanup() {
    const client = await MongoClient.connect('mongodb://localhost:27017/charronix_db?replicaSet=rs0&directConnection=true');
    const db = client.db();
    
    // Find students with non-UUID _id (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const allStudents = await db.collection('students').find({}).toArray();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    const badStudents = allStudents.filter(s => !uuidRegex.test(s._id));
    console.log('Bad records found:', badStudents.length);
    
    for (const s of badStudents) {
        console.log('Deleting bad student:', s._id, '|', s.first_name, s.last_name);
        await db.collection('students').deleteOne({ _id: s._id });
        if (s.user_id) {
            await db.collection('users').deleteOne({ _id: s.user_id });
        }
    }
    
    // Also check the old "Student" collection (capital S) from earlier manual inserts
    const oldCollection = await db.collection('Student').countDocuments();
    if (oldCollection > 0) {
        console.log('Found old "Student" collection with', oldCollection, 'records - dropping it');
        await db.collection('Student').drop();
    }
    
    const remaining = await db.collection('students').countDocuments();
    console.log('✅ Remaining valid students:', remaining);
    
    await client.close();
}

cleanup();
