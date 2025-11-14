import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thriftstyle';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

// Sample data
const brands = [
  'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 
  'Supreme', 'Carhartt', 'Dickies', 'Vans', 'Levi\'s'
];

const categories = [
  'T-Shirts', 'Hoodies', 'Jackets', 'Jeans', 'Sneakers',
  'Accessories', 'Sweaters', 'Shorts', 'Dresses', 'Bags'
];

const conditions = ['new', 'like-new', 'used'];
const sizes = ['S', 'M', 'L', 'XL'];

const adjectives = ['Vintage', 'Classic', 'Modern', 'Retro', 'Urban', 'Casual', 'Premium', 'Rare', 'Limited', 'Authentic'];
const styles = ['Oversized', 'Slim Fit', 'Regular', 'Relaxed', 'Fitted', 'Cropped', 'Long', 'Short'];

function generateProductName(brand: string, category: string): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const style = styles[Math.floor(Math.random() * styles.length)];
  return `${adj} ${brand} ${style} ${category}`;
}

function generateDescription(name: string, condition: string): string {
  const descriptions = [
    `Authentic ${name} in ${condition} condition. Perfect for everyday wear.`,
    `High-quality ${name}. Well-maintained and ready to wear.`,
    `Stylish ${name} with unique character. A must-have for your wardrobe.`,
    `Timeless ${name} that never goes out of style. Great addition to any outfit.`,
    `Premium ${name} in excellent ${condition} condition. Carefully curated piece.`,
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateTags(brand: string, category: string): string[] {
  const baseTags = ['thrift', 'secondhand', 'preloved', 'sustainable'];
  const specificTags = [brand.toLowerCase(), category.toLowerCase(), 'fashion', 'streetwear'];
  return [...baseTags, ...specificTags].slice(0, 5);
}

function generatePrice(condition: string): number {
  const basePrice = Math.floor(Math.random() * 400000) + 50000; // 50k - 450k
  const conditionMultiplier = condition === 'new' ? 1.5 : condition === 'like-new' ? 1.2 : 1;
  return Math.floor(basePrice * conditionMultiplier / 1000) * 1000; // Round to nearest 1000
}

function generateImageUrl(seed: number, category: string): string {
  // Fallback to Picsum if no Pexels API key
  if (!PEXELS_API_KEY) {
    return `https://picsum.photos/seed/fashion-${category.toLowerCase()}-${seed}/800/800`;
  }
  
  // Pexels images will be fetched dynamically during generation
  // This is a placeholder that will be replaced with real Pexels URLs
  return `https://picsum.photos/seed/fashion-${category.toLowerCase()}-${seed}/800/800`;
}

// Fetch fashion images from Pexels API
async function fetchPexelsImages(query: string, count: number = 1): Promise<string[]> {
  if (!PEXELS_API_KEY) {
    console.log('  ⚠ No PEXELS_API_KEY, using placeholder images');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=square`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.log(`  ⚠ Pexels API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.photos?.map((photo: any) => photo.src.large) || [];
  } catch (error) {
    console.log('  ⚠ Error fetching Pexels images, using fallback');
    return [];
  }
}

function generateSlug(name: string, index: number): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + `-${index}`;
}

async function generateProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');

    const db = mongoose.connection.db;

    // Get or create brands
    console.log('Setting up brands...');
    const brandDocs = [];
    for (const brandName of brands) {
      const existing = await db.collection('brands').findOne({ name: brandName });
      if (existing) {
        brandDocs.push(existing);
      } else {
        const brand = {
          name: brandName,
          slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          createdAt: new Date(),
        };
        const result = await db.collection('brands').insertOne(brand);
        brandDocs.push({ ...brand, _id: result.insertedId });
      }
    }
    console.log(`✓ ${brandDocs.length} brands ready\n`);

    // Get or create categories
    console.log('Setting up categories...');
    const categoryDocs = [];
    for (const catName of categories) {
      const existing = await db.collection('categories').findOne({ name: catName });
      if (existing) {
        categoryDocs.push(existing);
      } else {
        const category = {
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          createdAt: new Date(),
        };
        const result = await db.collection('categories').insertOne(category);
        categoryDocs.push({ ...category, _id: result.insertedId });
      }
    }
    console.log(`✓ ${categoryDocs.length} categories ready\n`);

    // Get admin user as seller
    const adminUser = await db.collection('users').findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found! Please run migration first.');
      process.exit(1);
    }

    // Generate products
    console.log('Generating products...');
    const productsToInsert = [];
    const productCount = 50; // Generate 50 products

    // Cache for Pexels images by category
    const pexelsImageCache: Record<string, string[]> = {};

    for (let i = 0; i < productCount; i++) {
      const brand = brandDocs[Math.floor(Math.random() * brandDocs.length)];
      const category = categoryDocs[Math.floor(Math.random() * categoryDocs.length)];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const name = generateProductName(brand.name, category.name);
      const slug = generateSlug(name, i);
      
      // Check if product with this slug already exists
      const existing = await db.collection('products').findOne({ slug });
      if (existing) {
        console.log(`  Skipping duplicate: ${slug}`);
        continue;
      }

      // Get images from Pexels or use fallback
      let images: string[];
      const searchQuery = `${category.name} fashion clothing`;
      
      if (PEXELS_API_KEY) {
        // Use cache or fetch new images
        if (!pexelsImageCache[category.name]) {
          console.log(`  Fetching Pexels images for ${category.name}...`);
          const fetchedImages = await fetchPexelsImages(searchQuery, 15);
          pexelsImageCache[category.name] = fetchedImages.length > 0 ? fetchedImages : [];
        }

        const cachedImages = pexelsImageCache[category.name];
        if (cachedImages.length > 0) {
          // Pick random images from cache
          const numImages = Math.min(Math.floor(Math.random() * 3) + 2, cachedImages.length);
          images = [];
          const usedIndices = new Set<number>();
          while (images.length < numImages) {
            const idx = Math.floor(Math.random() * cachedImages.length);
            if (!usedIndices.has(idx)) {
              images.push(cachedImages[idx]);
              usedIndices.add(idx);
            }
          }
        } else {
          // Fallback to placeholder
          const numImages = Math.floor(Math.random() * 3) + 2;
          images = Array.from({ length: numImages }, (_, idx) => 
            generateImageUrl(i * 100 + idx, category.name)
          );
        }
      } else {
        // Use placeholder images
        const numImages = Math.floor(Math.random() * 3) + 2;
        images = Array.from({ length: numImages }, (_, idx) => 
          generateImageUrl(i * 100 + idx, category.name)
        );
      }

      const product = {
        name,
        slug,
        description: generateDescription(name, condition),
        images,
        category: category._id,
        brand: brand._id,
        seller: adminUser._id,
        sizes: [sizes[Math.floor(Math.random() * sizes.length)]],
        condition,
        price: generatePrice(condition),
        stock: 1,
        sold: Math.floor(Math.random() * 20),
        listingStatus: 'ACTIVE',
        avgRating: Math.floor(Math.random() * 2) + 3.5, // 3.5-5.0
        ratingCount: Math.floor(Math.random() * 50),
        tags: generateTags(brand.name, category.name),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
      };

      productsToInsert.push(product);
    }

    if (productsToInsert.length > 0) {
      await db.collection('products').insertMany(productsToInsert);
      console.log(`✓ Generated ${productsToInsert.length} new products\n`);
    }

    console.log('✅ Product generation completed!');
    console.log(`\nSummary:`);
    console.log(`  - Brands: ${brandDocs.length}`);
    console.log(`  - Categories: ${categoryDocs.length}`);
    console.log(`  - Products: ${productsToInsert.length}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

generateProducts();
