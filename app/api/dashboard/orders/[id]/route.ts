import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth(request)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    await connectDB()

    const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
