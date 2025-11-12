import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const page = Number(request.nextUrl.searchParams.get("page")) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await Order.countDocuments({ user: session.user.id })

    return NextResponse.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
