import { readFileSync } from 'fs';
import { join } from 'path';
import { BSON } from 'bson';
import mongoose from 'mongoose';

const BACKUP_PATH = 'C:\\Users\\MyBook Hype AMD\\Downloads\\thriftstyle\\thriftstyle';
const MONGODB_URI = 'mongodb://localhost:27017/thriftstyle';

const collections = [
  'brands',
  'categories', 
  'users',
  'products',
  'reviews',
  'orders'
];

async function importCollection(collectionName: string) {
  try {
    const bsonPath = join(BACKUP_PATH, `${collectionName}.bson`);
    console.log(`\nImporting ${collectionName}...`);
    
    // Read BSON file
    const buffer = readFileSync(bsonPath);
    
    // Parse BSON documents
    const documents = [];
    let offset = 0;
    
    while (offset < buffer.length) {
      try {
        // Read document size (first 4 bytes, little-endian)
        if (offset + 4 > buffer.length) break;
        
        const docSize = buffer.readInt32LE(offset);
        
        if (docSize <= 0 || offset + docSize > buffer.length) {
          break;
        }
        
        // Extract document bytes
        const docBuffer = buffer.slice(offset, offset + docSize);
        
        // Deserialize BSON
        const doc = BSON.deserialize(docBuffer);
        documents.push(doc);
        
        offset += docSize;
      } catch (e) {
        console.error(`Error parsing document at offset ${offset}:`, e);
        break;
      }
    }
    
    if (documents.length === 0) {
      console.log(`⚠ No documents found in ${collectionName}`);
      return;
    }
    
    // Get collection and insert documents
    const collection = mongoose.connection.collection(collectionName);
    
    // Clear existing data
    await collection.deleteMany({});
    
    // Insert new data
    await collection.insertMany(documents);
    
    console.log(`✓ Imported ${documents.length} documents to ${collectionName}`);
  } catch (error: any) {
    console.error(`✗ Error importing ${collectionName}:`, error.message);
  }
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    
    for (const collection of collections) {
      await importCollection(collection);
    }
    
    console.log('\n✓ Database import completed!');
    console.log('You can now run: npm run dev');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
