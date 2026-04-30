import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

console.log('🔧 Fixing Prisma Schema for MongoDB...\n');

// 1. Add @map("_id") to all @id fields
console.log('1️⃣  Adding @map("_id") to ID fields...');
schema = schema.replace(
  /(\s+id\s+String\s+@id\s+@default\(uuid\(\)\))/g,
  '$1 @map("_id")'
);
console.log('   ✅ ID fields updated');

// 2. Replace Decimal with Float (MongoDB doesn't support Decimal)
console.log('2️⃣  Converting Decimal → Float...');
const decimalCount = (schema.match(/Decimal/g) || []).length;
schema = schema.replace(/Decimal/g, 'Float');
console.log(`   ✅ ${decimalCount} Decimal fields converted to Float`);

// 3. Remove @db.Decimal() annotations  
console.log('3️⃣  Removing @db.Decimal annotations...');
schema = schema.replace(/ @db\.Decimal\([^)]*\)/g, '');
console.log('   ✅ Decimal annotations removed');

// 4. Remove @db.Date (keep DateTime, just remove the @db.Date part)
console.log('4️⃣  Cleaning up @db.Date annotations...');
schema = schema.replace(/ @db\.Date/g, '');
console.log('   ✅ @db.Date annotations removed');

// 5. Remove @db.Time and replace with DateTime
console.log('5️⃣  Handling @db.Time fields...');
schema = schema.replace(/@db\.Time/g, '');
console.log('   ✅ @db.Time annotations removed');

// 6. Write back
fs.writeFileSync(schemaPath, schema);
console.log('\n✨ Schema fixed successfully!');
console.log('📁 Updated: prisma/schema.prisma');
console.log('\n✅ Ready for: npx prisma generate');
