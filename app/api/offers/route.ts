import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/mongodb"
import Offer from "@/models/Offer"
import Product from "@/models/Product"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, offerPrice } = await req.json()

    if (!productId || !offerPrice || offerPrice <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    await dbConnect()

    // Get product to verify it exists and get seller
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.listingStatus !== "ACTIVE") {
      return NextResponse.json({ error: "Product is no longer available" }, { status: 400 })
    }

    // Check if buyer is trying to make offer on their own product
    if (product.seller.toString() === session.user.id) {
      return NextResponse.json({ error: "Cannot make offer on your own product" }, { status: 400 })
    }

    // Check if buyer already has a pending offer on this product
    const existingOffer = await Offer.findOne({
      product: productId,
      buyer: session.user.id,
      status: "PENDING",
    })

    if (existingOffer) {
      return NextResponse.json({ error: "You already have a pending offer on this product" }, { status: 400 })
    }

    const offer = await Offer.create({
      product: productId,
      buyer: session.user.id,
      seller: product.seller,
      offerPrice,
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    console.error("Create offer error:", error)
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get all offers where user is buyer or seller
    const offers = await Offer.find({
      $or: [{ buyer: session.user.id }, { seller: session.user.id }],
    })
      .populate("product", "name images price slug")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json(offers)
  } catch (error) {
    console.error("Get offers error:", error)
    return NextResponse.json({ error: "Failed to get offers" }, { status: 500 })
  }
}
