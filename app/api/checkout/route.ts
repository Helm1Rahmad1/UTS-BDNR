import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import Cart from "@/models/Cart"
import Product from "@/models/Product"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items, shippingAddress } = await request.json()

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    await connectDB()

    // Calculate total and validate stock
    let total = 0
    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product || product.stock < item.qty) {
        return NextResponse.json({ error: `${product?.name} is out of stock` }, { status: 400 })
      }
      total += item.price * item.qty
    }

    // Create order
    const order = new Order({
      user: session.user.id,
      items,
      total,
      shippingAddress,
      status: "PENDING",
    })

    await order.save()

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty, sold: item.qty },
      })
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: session.user.id })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
