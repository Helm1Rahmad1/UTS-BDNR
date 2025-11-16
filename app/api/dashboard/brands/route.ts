import { connectDB } from "@/lib/mongodb"
import Brand from "@/models/Brand"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const brands = await Brand.find({}).sort({ name: 1 })

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Get brands error:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()
    const trimmedName = typeof name === "string" ? name.trim() : ""

    if (!trimmedName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    await connectDB()

    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

    const existing = await Brand.findOne({ slug })
    if (existing) {
      return NextResponse.json(existing)
    }

    const brand = await Brand.create({ name: trimmedName, slug })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error("Create brand error:", error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}
