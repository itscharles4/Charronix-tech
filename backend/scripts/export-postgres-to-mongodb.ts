import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ExportData {
  [collection: string]: any[];
}

async function exportAllData() {
  console.log('🚀 Starting PostgreSQL → MongoDB Export\n');
  console.log('📊 Fetching all data from PostgreSQL...\n');

  const exportData: ExportData = {};
  let totalRecords = 0;

  try {
    // List of all models to export (in dependency order to avoid FK issues)
    const models = [
      'User',
      'Student',
      'Teacher',
      'Parent',
      'Subject',
      'Class',
      'Section',
      'TimeSlot',
      'Timetable',
      'Attendance',
      'AcademicGrade',
      'Achievement',
      'Notice',
      'Notification',
      'Assignment',
      'Submission',
      'AiChatHistory',
      'AuditLog',
      'FileUpload',
      'CommunicationLog',
      'Complaint',
      'FeeRecord',
      'Payment',
      'MedicalInfo',
      'StudentTransport',
      'Transport',
      'BoardingLog',
      'PasswordResetToken',
      'RefreshToken',
      'Session',
      'SystemSetting',
      'RolePermission',
    ];

    for (const model of models) {
      try {
        // @ts-ignore - Dynamic model access
        const data = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].findMany({
          take: 10000, // Limit per model
        });

        if (data.length > 0) {
          exportData[model] = data;
          totalRecords += data.length;
          console.log(`  ✅ ${model}: ${data.length} records`);
        } else {
          console.log(`  ⊘ ${model}: 0 records`);
        }
      } catch (error: any) {
        console.log(`  ⚠️  ${model}: Error or doesn't exist`);
      }
    }

    // Save to file
    const exportPath = path.join(__dirname, 'postgres-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log(`\n✅ Export Complete!`);
    console.log(`📁 File saved: ${exportPath}`);
    console.log(`📊 Total records: ${totalRecords}\n`);
    console.log('📋 Summary:');
    Object.entries(exportData).forEach(([model, data]) => {
      console.log(`   • ${model}: ${data.length}`);
    });
  } catch (error: any) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportAllData();
