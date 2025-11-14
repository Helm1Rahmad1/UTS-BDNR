import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thriftstyle';

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    // Get current count
    const beforeCount = await db.collection('products').countDocuments();
    console.log(`Current products: ${beforeCount}`);

    // Keep only 20 products for testing
    const keepCount = 20;
    
    if (beforeCount <= keepCount) {
      console.log(`\n✓ Already have ${beforeCount} products, no cleanup needed.`);
      return;
    }

    // Get products to keep (first 20)
    const productsToKeep = await db.collection('products')
      .find({})
      .limit(keepCount)
      .project({ _id: 1 })
      .toArray();
    
    const keepIds = productsToKeep.map(p => p._id);

    // Delete the rest
    const deleteResult = await db.collection('products').deleteMany({
      _id: { $nin: keepIds }
    });

    console.log(`\n✓ Deleted ${deleteResult.deletedCount} products`);
    console.log(`✓ Kept ${keepCount} products for testing`);

    // Also cleanup orphaned reviews
    const reviewResult = await db.collection('reviews').deleteMany({
      product: { $nin: keepIds }
    });

    if (reviewResult.deletedCount > 0) {
      console.log(`✓ Cleaned up ${reviewResult.deletedCount} orphaned reviews`);
    }

    console.log('\n✅ Cleanup completed!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

cleanup();
