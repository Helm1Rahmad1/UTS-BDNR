import { connectDB } from "@/lib/mongodb"
import Brand from "@/models/Brand"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDB()

    const brands = await Brand.find({})
      .sort({ name: 1 })
      .lean()

    // Convert ObjectIds to strings
    const brandsData = brands.map(brand => ({
      ...brand,
      _id: brand._id.toString(),
    }))

    return NextResponse.json(brandsData)
  } catch (error) {
    console.error("Brands fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}