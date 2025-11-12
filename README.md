# ThriftStyle - Modern Thrift Fashion E-Commerce

A full-stack e-commerce platform for buying and selling thrifted fashion items, built with Next.js 14, MongoDB, and Tailwind CSS.

## Features

- **Product Catalog**: Browse thrifted items with full-text search and advanced filtering
- **User Authentication**: Email/password registration and login with NextAuth.js
- **Shopping Cart**: Guest cart with localStorage, synced to database on login
- **Checkout**: Secure checkout with address validation
- **Order Management**: Track orders and view order history
- **Review System**: Rate and review products with aggregated ratings
- **Admin Dashboard**: Complete CRUD operations and analytics
- **Aggregation Pipeline**: MongoDB aggregations for analytics and filtering

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js App Router, Server Actions, Route Handlers
- **Database**: MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS v4, Framer Motion

## Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- npm or pnpm

### Setup

1. Clone the repository
2. Install dependencies:

\`\`\`bash
pnpm install
\`\`\`

3. Create `.env.local` with your environment variables:

\`\`\`env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/thriftstore?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
\`\`\`

4. Run the development server:

\`\`\`bash
pnpm dev
\`\`\`

5. Seed the database with sample data:

\`\`\`bash
pnpm seed
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

## Default Credentials

After seeding, use these credentials:

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

**Product**
- `name: String`
- `slug: String (unique)`
- `description: String`
- `images: [String]`
- `category: ObjectId -> Category`
- `brand: ObjectId -> Brand`
- `sizes: ["S", "M", "L", "XL"]`
- `condition: "new" | "like-new" | "used"`
- `price: Number`
- `stock: Number`
- `sold: Number`
- `avgRating: Number`
- `ratingCount: Number`
- `tags: [String]`
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

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Start production server
- `pnpm seed` - Seed database with sample data
- `pnpm lint` - Run ESLint

## Environment Variables

See `.env.example` for all available variables.

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
