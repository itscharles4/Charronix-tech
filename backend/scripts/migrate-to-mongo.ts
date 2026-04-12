import { Client } from 'pg';
import { MongoClient, Decimal128 } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const PG_URL = process.env.DATABASE_URL || 'postgresql://charronix_user:charronix_pass_2024@localhost:5432/charronix_db';
const MONGO_URL = 'mongodb+srv://charlesjehanabad12345_db_user:QnxvTS546eTPe22a@cluster0.tui3r3t.mongodb.net/?appName=Cluster0';
const MONGO_DB_NAME = 'charronix_db';

async function migrate() {
    console.log('🚀 Starting Database Migration...');
    
    const pgClient = new Client({ connectionString: PG_URL });
    const mongoClient = new MongoClient(MONGO_URL);

    try {
        await pgClient.connect();
        await mongoClient.connect();
        console.log('✅ Connected to PostgreSQL and MongoDB');

        const db = mongoClient.db(MONGO_DB_NAME);

        // 1. Get all public tables
        const tableRes = await pgClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        const tables = tableRes.rows.map((r: any) => r.table_name);
        console.log(`📂 Found ${tables.length} tables to migrate: ${tables.join(', ')}`);

        for (const table of tables) {
            console.log(`\n⏳ Migrating table: ${table}...`);
            
            // 2. Fetch all data from the table
            const dataRes = await pgClient.query(`SELECT * FROM "${table}"`);
            const rows = dataRes.rows;

            if (rows.length === 0) {
                console.log(`⏩ Table ${table} is empty, skipping.`);
                continue;
            }

            // 3. Clean/Sanitize data for MongoDB
            const sanitizedRows = rows.map((row: any) => {
                const newRow: any = { ...row };
                for (const key in newRow) {
                    const val = newRow[key];
                    // Handle Decimal types
                    if (val && typeof val === 'object' && val.constructor.name === 'Decimal') {
                        newRow[key] = parseFloat(val.toString());
                    }
                    // Handle nulls if necessary (MongoDB stores nulls fine)
                }
                return newRow;
            });

            // 4. Insert into MongoDB
            const collection = db.collection(table);
            
            // Optional: Clear existing data in collection
            await collection.deleteMany({});
            
            const result = await collection.insertMany(sanitizedRows);
            console.log(`✅ Table ${table} migrated successfullly. Documents inserted: ${result.insertedCount}`);
        }

        console.log('\n✨ Migration Complete!');
        console.log(`🔗 You can now connect to MongoDB Compass using: ${MONGO_URL}${MONGO_DB_NAME}`);

    } catch (err) {
        console.error('❌ Migration Failed:', err);
    } finally {
        await pgClient.end();
        await mongoClient.close();
    }
}

migrate();
