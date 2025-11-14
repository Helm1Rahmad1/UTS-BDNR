import Link from "next/link"
import { Button } from "@/components/ui/button"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import Category from "@/models/Category"
import ProductSections from "@/components/product-sections"

async function getHomeData() {
  try {
    await connectDB()

    // Top selling products with category lookup
    const topSellingRaw = await Product.aggregate([
      { $sort: { sold: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    ])

    // New products with category lookup
    const newProductsRaw = await Product.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    ])

    // Popular categories
    const popularCategories = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },
      {
        $group: {
          _id: "$categoryData.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ])

    // Convert to plain objects
    const topSelling = topSellingRaw.map(product => ({
      ...product,
      _id: product._id.toString(),
      category: product.category ? {
        ...product.category,
        _id: product.category._id.toString()
      } : null,
      brand: product.brand ? product.brand.toString() : null,
      seller: product.seller ? product.seller.toString() : null,
    }))

    const newProducts = newProductsRaw.map(product => ({
      ...product,
      _id: product._id.toString(),
      category: product.category ? {
        ...product.category,
        _id: product.category._id.toString()
      } : null,
      brand: product.brand ? product.brand.toString() : null,
      seller: product.seller ? product.seller.toString() : null,
    }))

    return { topSelling, newProducts, popularCategories }
  } catch (error) {
    console.error("Home data error:", error)
    return { topSelling: [], newProducts: [], popularCategories: [] }
  }
}

export default async function Home() {
  const { topSelling, newProducts, popularCategories } = await getHomeData()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold md:text-5xl">Discover Unique Thrifted Fashion</h1>
            <p className="mt-4 text-lg text-muted-foreground">Sustainable style meets modern trends</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/products">
                <Button size="lg">Shop Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {popularCategories.map((category) => (
              <Link key={category._id} href={`/products?category=${category._id}`} className="group">
                <div className="rounded-lg bg-muted p-6 text-center hover:bg-primary/10 transition">
                  <p className="font-semibold group-hover:text-primary">{category._id}</p>
                  <p className="text-sm text-muted-foreground">{category.count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <ProductSections topSelling={topSelling} newProducts={newProducts} />
      
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/products">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
