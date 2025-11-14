# ThriftStyle - C2C Marketplace for Thrifted Fashion

A full-stack C2C (Consumer-to-Consumer) marketplace for buying and selling thrifted fashion items, built with Next.js 16, MongoDB, and Tailwind CSS.

## Features

### Core Features
- **C2C Marketplace**: Users can sell their own items (seller model)
- **Product Catalog**: Browse thrifted items with full-text search and advanced filtering
- **Offer System**: Make price offers on products (negotiation feature)
- **User Authentication**: Email/password registration and login with NextAuth.js
- **Shopping Cart**: Guest cart with localStorage, synced to database on login
- **Checkout**: Secure checkout with address validation
- **Order Management**: Track orders and view order history
- **Review System**: Rate and review products with aggregated ratings
- **Admin Dashboard**: Complete CRUD operations and analytics
- **Aggregation Pipeline**: MongoDB aggregations with $lookup for analytics and filtering

### New C2C Features
- **Seller System**: Each product has a seller (User reference)
- **Listing Status**: Products marked as ACTIVE or SOLD
- **Offer Negotiation**: Buyers can make price offers
- **Offer Management**: Sellers can accept/decline offers
- **Auto-decline**: Other offers declined when one is accepted
- **My Offers View**: Aggregation pipeline with $lookup to join offer data

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js App Router, Server Actions, Route Handlers
- **Database**: MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS v4

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or pnpm

### Setup

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

3. Create `.env.local` with your environment variables:

\`\`\`env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/thriftstyle

# Or for MongoDB Atlas
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/thriftstore?retryWrites=true&w=majority

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Optional: Pexels API for real fashion images in generate script
# Get free API key at: https://www.pexels.com/api/
# PEXELS_API_KEY=your-pexels-api-key
\`\`\`

4. Import existing database (if you have backup files):

\`\`\`bash
npm run import
\`\`\`

5. Or generate sample products:

\`\`\`bash
npm run generate
\`\`\`

6. Run migration to add seller field to existing products:

\`\`\`bash
npm run migrate
\`\`\`

7. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

8. Open [http://localhost:3000](http://localhost:3000)

## Default Credentials

After importing/seeding, use these credentials:

**Admin Account**
- Email: admin@thriftstyle.com
- Password: admin123

**User Account**
- Email: john@example.com
- Password: user123

## API Endpoints

### Products
- `GET /api/products` - List products with filters, search, sort
- `GET /api/products/[slug]` - Get product details
- `POST /api/dashboard/products` - Create product (admin)
- `PATCH /api/dashboard/products/[id]` - Update product (admin)
- `DELETE /api/dashboard/products/[id]` - Delete product (admin)

### Offers (NEW)
- `POST /api/offers` - Create offer on a product (user)
- `GET /api/offers` - Get all offers (buyer/seller)
- `GET /api/offers/[id]` - Get offer details
- `PATCH /api/offers/[id]` - Accept/decline offer (seller only)
- `GET /api/users/my-offers` - Get offers with aggregation ($lookup)

### Reviews
- `GET /api/reviews?product=[id]` - Get product reviews
- `POST /api/reviews` - Create/update review (user)
- `DELETE /api/reviews/[id]` - Delete review (user)

### Cart & Checkout
- `GET /api/cart/sync` - Get user cart
- `POST /api/cart/sync` - Sync cart
- `POST /api/checkout` - Create order

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/dashboard/orders` - Get all orders (admin)
- `PATCH /api/dashboard/orders/[id]` - Update order status (admin)

### Dashboard
- `GET /api/dashboard/metrics` - Get analytics
- `GET /api/dashboard/categories` - Get categories
- `POST /api/dashboard/categories` - Create category (admin)
- `PATCH /api/dashboard/categories/[id]` - Update category (admin)
- `DELETE /api/dashboard/categories/[id]` - Delete category (admin)

## Database Schema

### Collections

**User**
- `name: String`
- `email: String (unique)`
- `passwordHash: String`
- `role: "user" | "admin"`
- `createdAt: Date`

**Product** (Updated for C2C)
- `name: String`
- `slug: String (unique)`
- `description: String`
- `images: [String]`
- `category: ObjectId -> Category`
- `brand: ObjectId -> Brand`
- `seller: ObjectId -> User` *(NEW - required)*
- `sizes: ["S", "M", "L", "XL"]`
- `condition: "new" | "like-new" | "used"`
- `price: Number`
- `stock: Number (default: 1)`
- `sold: Number`
- `listingStatus: "ACTIVE" | "SOLD"` *(NEW)*
- `avgRating: Number`
- `ratingCount: Number`
- `tags: [String]`
- `createdAt: Date`

**Offer** (NEW)
- `product: ObjectId -> Product`
- `buyer: ObjectId -> User`
- `seller: ObjectId -> User`
- `offerPrice: Number`
- `status: "PENDING" | "ACCEPTED" | "DECLINED"`
- `createdAt: Date`

**Review**
- `user: ObjectId -> User`
- `product: ObjectId -> Product`
- `rating: 1-5`
- `comment: String`
- `createdAt: Date`

**Order**
- `user: ObjectId -> User`
- `items: [{ product, size, qty, price }]`
- `total: Number`
- `status: "PENDING" | "PAID" | "CANCELLED"`
- `shippingAddress: { name, phone, address, city, postalCode }`
- `createdAt: Date`

**Category**
- `name: String (unique)`
- `slug: String (unique)`
- `createdAt: Date`

**Brand**
- `name: String (unique)`
- `slug: String (unique)`
- `createdAt: Date`

## Key Implementations

### MongoDB Aggregation Pipelines

1. **Top-Selling Categories** (Dashboard)
   \`\`\`
   $unwind -> $lookup (products) -> $lookup (categories) -> $group -> $sort -> $limit
   \`\`\`

2. **Product Filtering with Join** (Catalog)
   \`\`\`
   $match (filters) -> $lookup (category/brand) -> $sort -> $facet (pagination)
   \`\`\`

3. **Product Rating** (Detail Page)
   \`\`\`
   $match (product) -> $group (avgRating, count) -> Update product denormalized fields
   \`\`\`

4. **Top Brands** (Dashboard)
   \`\`\`
   $unwind -> $lookup (products) -> $lookup (brands) -> $group -> $sort
   \`\`\`

5. **My Offers with Join** (NEW - for UTS)
   \`\`\`
   $match (user offers) -> $lookup (products) -> $lookup (buyers) -> $lookup (sellers) -> $project -> $sort
   \`\`\`

### C2C Marketplace Features

- **Seller Assignment**: Every product must have a seller (User reference)
- **Listing Management**: Products have ACTIVE/SOLD status
- **Offer System**: 
  - Buyers can make offers on ACTIVE products
  - Only one PENDING offer per buyer per product
  - Sellers can accept/decline offers
  - Accepting an offer marks product as SOLD
  - Other pending offers auto-declined when one is accepted
- **Aggregation Queries**: Uses MongoDB $lookup to join collections for efficient data retrieval

### Advanced Features

- **Full-Text Search**: Text indexes on product name, description, tags
- **Pagination**: Using $facet for efficient data + count fetching
- **Join Operations**: $lookup for category, brand, user population
- **Denormalization**: avgRating, ratingCount updated after each review
- **Cart Sync**: Guest cart in localStorage synced to DB on login

## Folder Structure

\`\`\`
.
├── app/
│   ├── api/                    # API routes
│   ├── auth/                   # Auth pages
│   ├── cart/                   # Cart page
│   ├── checkout/               # Checkout page
│   ├── dashboard/              # Admin dashboard
│   ├── orders/                 # Orders pages
│   ├── products/               # Product catalog
│   └── layout.tsx
├── components/
│   ├── auth/                   # Auth components
│   ├── dashboard/              # Dashboard components
│   ├── ui/                     # shadcn components
│   ├── header.tsx
│   ├── footer.tsx
│   └── product-*.tsx
├── models/                     # Mongoose schemas
├── lib/                        # Utilities
├── scripts/                    # Database scripts
└── middleware.ts               # Auth middleware
\`\`\`

## Deployment

Deploy to Vercel with these steps:

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

The MongoDB connection string is automatically resolved.

## Performance Optimizations

- Text indexes for full-text search
- Compound indexes for filtering queries
- Pagination with $facet for efficient counting
- Image optimization with Next.js Image component
- Responsive images for mobile-first design

## Security

- Password hashing with bcrypt
- NextAuth.js for session management
- Protected routes with middleware
- Role-based access control (RBAC)
- Input validation on server
- Row-level security ready for Supabase

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run seed` - Seed database with sample data (original)
- `npm run import` - Import database from BSON files
- `npm run migrate` - Add seller field to existing products
- `npm run generate` - Generate 50 dummy products with images
- `npm run backup` - Export database to JSON files (for sharing)
- `npm run restore` - Import database from JSON backup files
- `npm run lint` - Run ESLint

## Database Management

### Backup Database (For Team Sharing)
Export your current database to JSON files in `database_backup/`:
\`\`\`bash
npm run backup
\`\`\`

This creates JSON files that can be committed to git and shared with your team. Files include:
- `brands.json` - Brand data
- `categories.json` - Category data
- `users.json` - User accounts (including admin)
- `products.json` - All products with seller references
- `reviews.json` - Product reviews

### Restore Database (For New Team Members)
After cloning the repository, restore the database:
\`\`\`bash
npm run restore
\`\`\`

This imports all JSON files from `database_backup/` into your local MongoDB. Perfect for onboarding new developers!

### Import from BSON Backup
If you have BSON backup files (legacy format):
\`\`\`bash
npm run import
\`\`\`

### Generate Sample Data
Generate 50 products with placeholder images:
\`\`\`bash
npm run generate
\`\`\`

### Migrate Existing Data
Add seller field to products already in database:
\`\`\`bash
npm run migrate
\`\`\`

## Team Collaboration Workflow

### For Any Team Member Making Changes

1. **Pull latest changes first:**
   \`\`\`bash
   git pull
   npm run restore
   \`\`\`

2. Make changes to database (add products, categories, etc.)

3. **Export your database:**
   \`\`\`bash
   npm run backup
   \`\`\`

4. **Commit and push the backup files:**
   \`\`\`bash
   git add database_backup/*.json
   git commit -m "Update backup - added new products"
   git push
   \`\`\`

5. **Notify your team** to pull and restore

### For Team Members Receiving Updates

When your teammate pushes new backup:

1. **Pull the latest changes:**
   \`\`\`bash
   git pull
   \`\`\`

2. **Restore database:**
   \`\`\`bash
   npm run restore
   \`\`\`

3. **Restart dev server (if running):**
   \`\`\`bash
   npm run dev
   \`\`\`

✅ Your database is now synced!

### First Time Setup (New Team Member)

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd UTS-BDNR
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`

3. Create `.env.local`:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/thriftstyle
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   \`\`\`

4. Restore database:
   \`\`\`bash
   npm run restore
   \`\`\`
   
   This will import:
   - 19 brands
   - 13 categories
   - 7 users (including admin@thriftstyle.com)
   - 150 products
   - 164 reviews

5. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Login with admin credentials:
   - Email: `admin@thriftstyle.com`
   - Password: `admin123`

✅ You now have the exact same database as your teammate!

## Environment Variables

See `.env.example` for all available variables.

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
