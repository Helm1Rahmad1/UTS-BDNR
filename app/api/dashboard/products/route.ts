import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import Category from "@/models/Category"
import Brand from "@/models/Brand"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

type SerializableProduct = {
  _id: string
  name: string
  slug: string
  description: string
  images: string[]
  category: null | { _id: string; name?: string; slug?: string }
  brand: null | { _id: string; name?: string; slug?: string }
  seller?: string
  sizes: string[]
  tags?: string[]
  condition: string
  price: number
  stock: number
  sold: number
  listingStatus: string
  avgRating: number
  ratingCount: number
  createdAt?: string
  updatedAt?: string
}

function normalizeProduct(product: any): SerializableProduct {
  const hasCategory = product.category && typeof product.category === "object"
  const hasBrand = product.brand && typeof product.brand === "object"

  return {
    ...product,
    _id: product._id?.toString() ?? "",
    category: hasCategory
      ? {
          ...product.category,
          _id: product.category._id?.toString?.() ?? product.category._id ?? "",
        }
      : null,
    brand: hasBrand
      ? {
          ...product.brand,
          _id: product.brand._id?.toString?.() ?? product.brand._id ?? "",
        }
      : null,
    seller: product.seller?.toString?.(),
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
  }
}

export async function GET(request: NextRequest) {
  // ensure schemas are registered before populate is invoked
  void Category
  void Brand

  try {
    const session = await auth(request)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const page = Number(request.nextUrl.searchParams.get("page")) || 1
    const limit = 10
    const skip = (page - 1) * limit
    const scope = request.nextUrl.searchParams.get("scope")

    // Default to showing items owned by the signed-in seller to avoid overwhelming the view.
    const query = scope === "all" ? {} : { seller: session.user.id }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category")
        .populate("brand")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      products: products.map(normalizeProduct),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get products error:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch products"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth(request)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    await connectDB()

    const slug = body.name.toLowerCase().replace(/\s+/g, "-")

    const product = new Product({
      ...body,
      slug,
    })

    await product.save()
    await product.populate(["category", "brand"])

    return NextResponse.json(normalizeProduct(product.toObject()), { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
