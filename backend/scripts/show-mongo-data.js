const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');

async function showData() {
    const uri = 'mongodb+srv://charlesjehanabad12345_db_user:QnxvTS546eTPe22a@cluster0.tui3r3t.mongodb.net/?appName=Cluster0';
    const client = new MongoClient(uri, { family: 4, tlsAllowInvalidCertificates: true });

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');
        
        const db = client.db('charronix_db');
        const collections = await db.listCollections().toArray();
        
        console.log('--- MONGODB COLLECTIONS & COUNTS ---');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }
        console.log('------------------------------------\n');
        
        // Show sample data for a few collections
        const sampleCollections = ['User', 'Student', 'Vehicle', 'StudentTransport']; // adjust depending on tables
        for (const name of sampleCollections) {
            const exists = collections.find(c => c.name === name);
            if (exists) {
                console.log(`\n--- Sample from ${name} ---`);
                const sample = await db.collection(name).findOne({});
                console.log(JSON.stringify(sample, null, 2));
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

showData();
