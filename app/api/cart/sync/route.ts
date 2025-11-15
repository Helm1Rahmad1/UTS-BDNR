import { connectDB } from "@/lib/mongodb"
import Cart from "@/models/Cart"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items } = await request.json()

    await connectDB()

    let cart = await Cart.findOne({ user: session.user.id })

    if (!cart) {
      cart = new Cart({
        user: session.user.id,
        items,
      })
    } else {
      cart.items = items
    }

    cart.updatedAt = new Date()
    await cart.save()

    return NextResponse.json(cart)
  } catch (error) {
    console.error("Cart sync error:", error)
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const cart = await Cart.findOne({ user: session.user.id }).populate({
      path: "items.product",
      model: "Product",
    })

    return NextResponse.json(cart || { items: [] })
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}
