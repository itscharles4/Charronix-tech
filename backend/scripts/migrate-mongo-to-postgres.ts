import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MONGO_URL = 'mongodb://localhost:27017/charronix_db';
const MONGO_DB = 'charronix_db';
const MONGO_COLLECTION = 'Student';

interface MongoStudent {
  _id?: any;
  admission_no: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date | null;
  gender?: string | null;
  class: string;
  section: string;
  roll_no: number;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  blood_group?: string | null;
  status: string;
  total_present?: number;
  total_absent?: number;
  attendance_percentage?: number;
  user_id?: string | null;
  photo_url?: string | null;
  address?: string | null;
  last_attendance_date?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

async function migrateMongoToPostgres() {
  const client = new MongoClient(MONGO_URL);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(MONGO_DB);
    const collection = db.collection<MongoStudent>(MONGO_COLLECTION);

    console.log('📊 Fetching students from MongoDB...');
    const mongoStudents = await collection.find({}).toArray();
    console.log(`✅ Found ${mongoStudents.length} students in MongoDB`);

    if (mongoStudents.length === 0) {
      console.log('⚠️  No students to migrate');
      return;
    }

    // Get existing students by admissionNo to avoid duplicates
    const existingAdmissions = await prisma.student.findMany({
      select: { admissionNo: true },
    });
    const existingAdmissionSet = new Set(
      existingAdmissions.map((s) => s.admissionNo)
    );

    let created = 0;
    let skipped = 0;

    console.log('\n📤 Migrating to PostgreSQL...');

    for (const mongoStudent of mongoStudents) {
      // Skip if already exists
      if (existingAdmissionSet.has(mongoStudent.admission_no)) {
        console.log(`⏭️  Skipping ${mongoStudent.admission_no} (already exists)`);
        skipped++;
        continue;
      }

      try {
        await prisma.student.create({
          data: {
            admissionNo: mongoStudent.admission_no,
            firstName: mongoStudent.first_name,
            lastName: mongoStudent.last_name,
            dateOfBirth: mongoStudent.date_of_birth || null,
            gender: mongoStudent.gender || 'Not Specified',
            class: mongoStudent.class,
            section: mongoStudent.section,
            rollNo: mongoStudent.roll_no,
            parentName: mongoStudent.parent_name || 'N/A',
            parentPhone: mongoStudent.parent_phone || 'N/A',
            parentEmail: mongoStudent.parent_email || null,
            bloodGroup: mongoStudent.blood_group || null,
            status: (mongoStudent.status as any) || 'ACTIVE',
            totalPresent: mongoStudent.total_present || 0,
            totalAbsent: mongoStudent.total_absent || 0,
            attendancePercentage: mongoStudent.attendance_percentage || 0,
            userId: mongoStudent.user_id || null,
            photoUrl: mongoStudent.photo_url || null,
            address: mongoStudent.address || null,
            lastAttendanceDate: mongoStudent.last_attendance_date || null,
            createdAt: mongoStudent.created_at || new Date(),
            updatedAt: mongoStudent.updated_at || new Date(),
          },
        });

        console.log(`✅ Migrated: ${mongoStudent.first_name} ${mongoStudent.last_name} (${mongoStudent.admission_no})`);
        created++;
      } catch (error: any) {
        console.error(
          `❌ Failed to migrate ${mongoStudent.admission_no}:`,
          error.message
        );
      }
    }

    console.log('\n📋 Migration Summary:');
    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  📊 Total: ${mongoStudents.length}`);
    console.log('\n✨ Migration completed successfully!');
    console.log('🌐 Refresh your frontend to see the migrated students');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    await prisma.$disconnect();
  }
}

migrateMongoToPostgres();
