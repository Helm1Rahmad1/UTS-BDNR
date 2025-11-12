import mongoose from "mongoose"
import bcryptjs from "bcryptjs"
import User from "@/models/User"
import Category from "@/models/Category"
import Brand from "@/models/Brand"
import Product from "@/models/Product"
import Review from "@/models/Review"
import Order from "@/models/Order"

const MONGODB_URI = process.env.MONGODB_URI!

async function seed() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined")
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    console.log("Clearing existing data...")
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
    ])

    // Create categories
    console.log("Creating categories...")
    const categories = await Category.insertMany([
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Jeans", slug: "jeans" },
      { name: "Jackets", slug: "jackets" },
      { name: "Dresses", slug: "dresses" },
      { name: "Hoodies", slug: "hoodies" },
      { name: "Vintage", slug: "vintage" },
      { name: "Accessories", slug: "accessories" },
      { name: "Shoes", slug: "shoes" },
      { name: "Skirts", slug: "skirts" },
      { name: "Sweaters", slug: "sweaters" },
    ])

    // Create brands
    console.log("Creating brands...")
    const brands = await Brand.insertMany([
      { name: "Levi's", slug: "levis" },
      { name: "Tommy Hilfiger", slug: "tommy-hilfiger" },
      { name: "Gap", slug: "gap" },
      { name: "Guess", slug: "guess" },
      { name: "Ralph Lauren", slug: "ralph-lauren" },
      { name: "Calvin Klein", slug: "calvin-klein" },
      { name: "Vintage Brand", slug: "vintage-brand" },
      { name: "Thrifted Co", slug: "thrifted-co" },
      { name: "Retro Wear", slug: "retro-wear" },
      { name: "Classic Cuts", slug: "classic-cuts" },
    ])

    // Create users
    console.log("Creating users...")
    const adminPassword = await bcryptjs.hash("admin123", 10)
    const userPassword = await bcryptjs.hash("user123", 10)

    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@thriftstyle.com",
        passwordHash: adminPassword,
        role: "admin",
      },
      {
        name: "John Doe",
        email: "john@example.com",
        passwordHash: userPassword,
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        passwordHash: userPassword,
        role: "user",
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        passwordHash: userPassword,
        role: "user",
      },
      {
        name: "Sarah Williams",
        email: "sarah@example.com",
        passwordHash: userPassword,
        role: "user",
      },
    ])

    // Create products
    console.log("Creating products...")
    const productNames = [
      "Vintage Levis 501 Jeans",
      "Classic White T-Shirt",
      "Oversized Denim Jacket",
      "Retro Striped Dress",
      "Cozy Fleece Hoodie",
      "Distressed Black Jeans",
      "Graphic Band T-Shirt",
      "Leather Jacket",
      "Vintage Cardigan",
      "High Waisted Jeans",
      "Faded Blue Denim",
      "Vintage Polo Shirt",
      "Cropped Sweater",
      "Slip Dress",
      "Combat Boots",
      "Vintage Windbreaker",
      "Oversized Blazer",
      "Silk Camisole",
      "Wide Leg Trousers",
      "Vintage Floral Dress",
      "Knit Sweater Vest",
      "Straight Leg Jeans",
      "Retro Sunglasses",
      "Vintage Belt",
      "Canvas Sneakers",
      "Wool Coat",
      "Vintage Scarf",
      "Platform Shoes",
      "Linen Shirt",
      "Vintage Bag",
      "Corduroy Pants",
      "Button-Up Shirt",
      "Vintage Jewelry",
      "Denim Shorts",
      "Crop Top",
      "Vintage Hat",
      "Printed Blouse",
      "Wide Collar Jacket",
      "Pinafore Dress",
      "Vintage Handbag",
    ]

    const conditions = ["new", "like-new", "used"]
    const sizes = ["S", "M", "L", "XL"]
    const products = []

    for (let i = 0; i < 100; i++) {
      const condition = conditions[Math.floor(Math.random() * conditions.length)]
      const price = Math.floor(Math.random() * 800000) + 50000

      products.push({
        name: productNames[Math.floor(Math.random() * productNames.length)] + ` #${i}`,
        slug: `product-${i}`,
        description: `Authentic thrifted item with unique vintage charm. ${condition === "new" ? "Never worn." : condition === "like-new" ? "Gently used." : "Well-loved and full of character."}`,
        images: [
          `/placeholder.svg?height=500&width=500&query=thrift-fashion-${i}`,
          `/placeholder.svg?height=500&width=500&query=vintage-clothing-${i}`,
        ],
        category: categories[Math.floor(Math.random() * categories.length)]._id,
        brand: brands[Math.floor(Math.random() * brands.length)]._id,
        sizes: [sizes[Math.floor(Math.random() * sizes.length)]],
        condition,
        price,
        stock: Math.floor(Math.random() * 20) + 1,
        tags: ["thrift", "vintage", "sustainable", "unique"],
      })
    }

    const createdProducts = await Product.insertMany(products)
    console.log(`Created ${createdProducts.length} products`)

    // Create reviews
    console.log("Creating reviews...")
    const reviews = []
    for (let i = 0; i < 200; i++) {
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
      const user = users[Math.floor(Math.random() * users.length)]
      const rating = Math.floor(Math.random() * 5) + 1

      const reviewComment = [
        "Great quality! Exactly as described.",
        "Love this piece! Perfect condition.",
        "Amazing deal for the price.",
        "Very happy with my purchase.",
        "Beautiful vintage find!",
        "Seller was very helpful.",
        "Arrived quickly and well-packaged.",
        "Highly recommend this item!",
        "Exactly what I was looking for.",
        "Very impressed with quality.",
      ]

      try {
        reviews.push({
          user: user._id,
          product: product._id,
          rating,
          comment: reviewComment[Math.floor(Math.random() * reviewComment.length)],
        })
      } catch (error) {
        // Skip if unique constraint fails
      }
    }

    await Review.insertMany(reviews, { ordered: false })
    console.log(`Created reviews`)

    // Update product ratings
    console.log("Updating product ratings...")
    for (const product of createdProducts) {
      const productReviews = await Review.find({ product: product._id })
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
        await Product.findByIdAndUpdate(product._id, {
          avgRating: Number.parseFloat(avgRating.toFixed(1)),
          ratingCount: productReviews.length,
        })
      }
    }

    // Create orders
    console.log("Creating sample orders...")
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const numItems = Math.floor(Math.random() * 3) + 1
      const items = []

      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
        items.push({
          product: product._id,
          size: "M",
          qty: Math.floor(Math.random() * 3) + 1,
          price: product.price,
        })
      }

      const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

      await Order.create({
        user: user._id,
        items,
        total: total + 50000 + Math.round(total * 0.1),
        status: ["PENDING", "PAID", "CANCELLED"][Math.floor(Math.random() * 3)],
        shippingAddress: {
          name: user.name,
          phone: "08123456789",
          address: "123 Jalan Utama",
          city: "Jakarta",
          postalCode: "12345",
        },
      })
    }

    console.log("Seed completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Seed error:", error)
    process.exit(1)
  }
}

seed()
