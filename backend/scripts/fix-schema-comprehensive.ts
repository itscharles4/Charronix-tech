import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

console.log('🔧 Comprehensive MongoDB Schema Fixes...\n');

// 1. Remove all @db.Float, @db.Text, @db.BigInt annotations
console.log('1️⃣  Removing @db.* type annotations...');
schema = schema.replace(/ @db\.[A-Za-z]+(\([^)]*\))?/g, '');
console.log('   ✅ @db annotations removed');

// 2. Find and fix duplicate @unique and @@index
console.log('2️⃣  Fixing duplicate indexes...');

const lines = schema.split('\n');
const fixedLines: string[] = [];
let inModel = false;
let modelIndices = new Set<string>();
let modelUniques = new Set<string>();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Check if entering a model
  if (line.trim().startsWith('model ')) {
    inModel = true;
    modelIndices.clear();
    modelUniques.clear();
    fixedLines.push(line);
    continue;
  }

  // Check if leaving a model
  if (inModel && line.trim().startsWith('}') && !line.includes('relation')) {
    inModel = false;
    fixedLines.push(line);
    continue;
  }

  // Skip duplicate @@unique and @@index
  if (inModel) {
    if (line.trim().startsWith('@@unique([')) {
      const key = line.trim();
      if (modelUniques.has(key)) {
        console.log(`   ⏭️  Skipped duplicate: ${key.substring(0, 50)}`);
        continue;
      }
      modelUniques.add(key);
    } else if (line.trim().startsWith('@@index([')) {
      const key = line.trim();
      if (modelIndices.has(key)) {
        console.log(`   ⏭️  Skipped duplicate: ${key.substring(0, 50)}`);
        continue;
      }
      modelIndices.add(key);
    }
  }

  fixedLines.push(line);
}

schema = fixedLines.join('\n');
console.log('   ✅ Duplicate indexes removed');

// 3. Write back
fs.writeFileSync(schemaPath, schema);
console.log('\n✨ All fixes applied!');
console.log('📁 Updated: prisma/schema.prisma');
console.log('\n✅ Ready for: npx prisma generate');
