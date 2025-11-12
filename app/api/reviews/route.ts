import { connectDB } from "@/lib/mongodb"
import Review from "@/models/Review"
import Product from "@/models/Product"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("product")

    if (!productId) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 })
    }

    await connectDB()

    const reviews = await Review.find({ product: productId })
      .populate({
        path: "user",
        select: "name",
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Get reviews error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product, rating, comment } = await request.json()

    if (!product || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    await connectDB()

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: session.user.id,
      product,
    })

    let review
    if (existingReview) {
      existingReview.rating = rating
      existingReview.comment = comment
      await existingReview.save()
      review = existingReview
    } else {
      review = new Review({
        user: session.user.id,
        product,
        rating,
        comment,
      })
      await review.save()
    }

    // Update product rating stats
    const reviews = await Review.find({ product })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await Product.findByIdAndUpdate(product, {
      avgRating: Number.parseFloat(avgRating.toFixed(1)),
      ratingCount: reviews.length,
    })

    await review.populate("user", "name")

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
