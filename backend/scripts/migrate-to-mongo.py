import psycopg2
from psycopg2.extras import RealDictCursor
from pymongo import MongoClient
import os
import decimal
from datetime import datetime

PG_URL = 'postgresql://charronix_user:charronix_pass_2024@localhost:5432/charronix_db'
MONGO_URL = 'mongodb+srv://charlesjehanabad12345_db_user:QnxvTS546eTPe22a@cluster0.tui3r3t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

print("🚀 Starting Database Migration (Python version to bypass Windows Node.js bug)...")

try:
    pg_conn = psycopg2.connect(PG_URL)
    mongo_client = MongoClient(MONGO_URL)

    db = mongo_client['charronix_db']

    with pg_conn.cursor() as cur:
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")
        tables = [row[0] for row in cur.fetchall()]

    print(f"📂 Found {len(tables)} tables to migrate.")

    for table in tables:
        print(f"⏳ Migrating table: {table}...")
        with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f'SELECT * FROM "{table}"')
            rows = cur.fetchall()
            
        if not rows:
            print(f"⏩ Table {table} is empty, skipping.")
            continue
            
        # Sanitize types (Decimal, etc) for MongoDB
        for row in rows:
            for k, v in list(row.items()):
                if isinstance(v, decimal.Decimal):
                    row[k] = float(v)
                    
        collection = db[table]
        collection.delete_many({}) # Clear existing data
        collection.insert_many(rows)
        print(f"✅ Table {table} migrated successfully. Documents inserted: {len(rows)}")

    print(f"\n✨ Migration Complete! You can view it in MongoDB Compass with: {MONGO_URL}")
except Exception as e:
    print(f"❌ Migration Failed: {e}")
finally:
    if 'pg_conn' in locals():
        pg_conn.close()
    if 'mongo_client' in locals():
        mongo_client.close()
