import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const brand = searchParams.get("brand") || ""
    const size = searchParams.get("size") || ""
    const condition = searchParams.get("condition") || ""
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : Number.POSITIVE_INFINITY
    const sort = searchParams.get("sort") || "-createdAt"
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 12

    const skip = (page - 1) * limit

    // Build match stage
    const matchStage: any = {
      stock: { $gt: 0 },
      price: { $gte: minPrice, $lte: maxPrice },
    }

    if (q) {
      matchStage.$text = { $search: q }
    }

    if (category) matchStage.category = category
    if (brand) matchStage.brand = brand
    if (condition) matchStage.condition = condition
    if (size) matchStage.sizes = size

    // Build sort stage
    let sortStage: any = {}
    if (sort === "price-asc") {
      sortStage = { price: 1 }
    } else if (sort === "price-desc") {
      sortStage = { price: -1 }
    } else if (sort === "rating") {
      sortStage = { avgRating: -1 }
    } else if (sort === "sold") {
      sortStage = { sold: -1 }
    } else {
      sortStage = { createdAt: -1 }
    }

    // Aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandData",
        },
      },
      {
        $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$brandData", preserveNullAndEmptyArrays: true },
      },
      {
        $facet: {
          data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]

    const result = await Product.aggregate(pipeline)

    const products = result[0].data
    const totalCount = result[0].totalCount[0]?.count || 0

    return NextResponse.json({
      products,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
