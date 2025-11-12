import { connectDB } from "@/lib/mongodb"
import Review from "@/models/Review"
import Product from "@/models/Product"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const review = await Review.findById(params.id)

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const productId = review.product

    await Review.findByIdAndDelete(params.id)

    // Update product rating stats
    const reviews = await Review.find({ product: productId })

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        avgRating: 0,
        ratingCount: 0,
      })
    } else {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await Product.findByIdAndUpdate(productId, {
        avgRating: Number.parseFloat(avgRating.toFixed(1)),
        ratingCount: reviews.length,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete review error:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
