import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thriftstyle';

async function checkSlugs() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const products = await db!.collection('products').find({}).limit(5).toArray();
    
    console.log('Sample product slugs:');
    products.forEach((p: any) => {
      console.log(`  - ${p.slug}`);
      console.log(`    Name: ${p.name}`);
      console.log(`    URL: /products/${p.slug}\n`);
    });
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkSlugs();
