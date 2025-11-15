import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/mongodb"
import Offer from "@/models/Offer"
import Product from "@/models/Product"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { status } = await req.json()

    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await dbConnect()

    const offer = await Offer.findById(id)
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    // Only seller can update offer status
    if (offer.seller.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only seller can update offer status" }, { status: 403 })
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json({ error: "Offer already processed" }, { status: 400 })
    }

    offer.status = status
    await offer.save()

    // If accepted, update product listing status to SOLD
    if (status === "ACCEPTED") {
      await Product.findByIdAndUpdate(offer.product, {
        listingStatus: "SOLD",
        stock: 0,
      })

      // Decline all other pending offers for this product
      await Offer.updateMany(
        {
          product: offer.product,
          _id: { $ne: id },
          status: "PENDING",
        },
        { status: "DECLINED" }
      )
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error("Update offer error:", error)
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const offer = await Offer.findById(id)
      .populate("product", "name images price slug")
      .populate("buyer", "name email")
      .populate("seller", "name email")

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    // Check if user is buyer or seller
    if (offer.buyer._id.toString() !== session.user.id && offer.seller._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error("Get offer error:", error)
    return NextResponse.json({ error: "Failed to get offer" }, { status: 500 })
  }
}
