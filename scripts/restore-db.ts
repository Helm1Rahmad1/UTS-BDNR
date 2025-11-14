import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thriftstyle';
const BACKUP_DIR = 'database_backup';

const collections = ['brands', 'categories', 'users', 'products', 'reviews', 'offers'];

async function restoreDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    for (const collectionName of collections) {
      try {
        const filePath = join(BACKUP_DIR, `${collectionName}.json`);
        console.log(`Restoring ${collectionName}...`);
        
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        
        if (!Array.isArray(data) || data.length === 0) {
          console.log(`  ⚠ No data in ${collectionName}`);
          continue;
        }

        // Clear existing data
        await db.collection(collectionName).deleteMany({});
        
        // Insert backup data
        await db.collection(collectionName).insertMany(data);
        
        console.log(`✓ Restored ${data.length} documents to ${collectionName}`);
      } catch (error: any) {
        console.error(`✗ Error restoring ${collectionName}:`, error.message);
      }
    }

    console.log('\n✅ Database restore completed!');
    console.log('You can now run: npm run dev');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

restoreDatabase();
