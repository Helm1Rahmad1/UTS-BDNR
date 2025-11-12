import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import Review from "@/models/Review"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB()

    const product = await Product.findOne({ slug: params.slug }).populate("category").populate("brand")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get reviews with user info
    const reviews = await Review.find({ product: product._id })
      .populate({
        path: "user",
        select: "name",
      })
      .sort({ createdAt: -1 })

    // Get related products (same category)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(8)
      .sort({ sold: -1 })

    return NextResponse.json({
      product,
      reviews,
      relatedProducts,
    })
  } catch (error) {
    console.error("Product detail error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
