import { connectDB } from "@/lib/mongodb"
import Category from "@/models/Category"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDB()

    const categories = await Category.find({})
      .sort({ name: 1 })
      .lean()

    // Convert ObjectIds to strings
    const categoriesData = categories.map(category => ({
      ...category,
      _id: category._id.toString(),
    }))

    return NextResponse.json(categoriesData)
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}