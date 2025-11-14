import mongoose from 'mongoose';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thriftstyle';
const BACKUP_DIR = 'database_backup';

const collections = ['brands', 'categories', 'users', 'products', 'reviews', 'offers'];

async function backup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');

    // Create backup directory
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    for (const collectionName of collections) {
      try {
        console.log(`Backing up ${collectionName}...`);
        
        const data = await db.collection(collectionName).find({}).toArray();
        
        if (data.length === 0) {
          console.log(`  ⚠ No data in ${collectionName}`);
          continue;
        }

        const filePath = join(BACKUP_DIR, `${collectionName}.json`);
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        
        console.log(`✓ Backed up ${data.length} documents`);
      } catch (error: any) {
        console.error(`✗ Error backing up ${collectionName}:`, error.message);
      }
    }

    console.log('\n✅ Backup completed!');
    console.log(`Files saved in: ${BACKUP_DIR}`);
    console.log('\nTo restore on another machine:');
    console.log('  npm run restore\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

backup();
