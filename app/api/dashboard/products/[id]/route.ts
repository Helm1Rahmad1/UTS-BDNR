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

const allowedFields = [
  "name",
  "description",
  "price",
  "stock",
  "condition",
  "category",
  "brand",
  "sizes",
  "images",
  "tags",
  "listingStatus",
]

const slugify = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth(request)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    void Category
    void Brand

    const product = await Product.findById(params.id).populate(["category", "brand"])
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(normalizeProduct(product.toObject()))
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth(request)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    await connectDB()
    void Category
    void Brand

    const productId = (params.id ?? body._id ?? body.id)?.toString().trim()
    if (!productId) {
      return NextResponse.json({ error: "Product identifier missing" }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field]
      }
    }

    if (typeof body.name === "string" && body.name.trim().length > 0) {
      updates.slug = slugify(body.name)
    }

    const product = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
    }).populate(["category", "brand"])

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(normalizeProduct(product.toObject()))
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth(request)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    await Product.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
