import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/thriftstyle';

async function updateProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');

    // Get admin user
    const adminUser = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.email}`);

    // Update all products without seller to have admin as seller
    const result = await mongoose.connection.db.collection('products').updateMany(
      { seller: { $exists: false } },
      { 
        $set: { 
          seller: adminUser._id,
          listingStatus: 'ACTIVE',
          stock: 1
        } 
      }
    );

    console.log(`\n✓ Updated ${result.modifiedCount} products`);
    console.log('✓ Migration completed!');

  } catch (error: any) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

updateProducts();
