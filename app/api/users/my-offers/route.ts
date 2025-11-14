import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userId = new mongoose.Types.ObjectId(session.user.id)

    // Use aggregation pipeline with $lookup to join with Product collection
    const offers = await mongoose.connection.db.collection("offers").aggregate([
      {
        $match: {
          $or: [{ buyer: userId }, { seller: userId }],
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyerDetails",
        },
      },
      {
        $unwind: {
          path: "$buyerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      {
        $unwind: {
          path: "$sellerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          offerPrice: 1,
          status: 1,
          createdAt: 1,
          product: {
            _id: "$productDetails._id",
            name: "$productDetails.name",
            slug: "$productDetails.slug",
            images: "$productDetails.images",
            price: "$productDetails.price",
            listingStatus: "$productDetails.listingStatus",
          },
          buyer: {
            _id: "$buyerDetails._id",
            name: "$buyerDetails.name",
            email: "$buyerDetails.email",
          },
          seller: {
            _id: "$sellerDetails._id",
            name: "$sellerDetails.name",
            email: "$sellerDetails.email",
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]).toArray()

    return NextResponse.json(offers)
  } catch (error) {
    console.error("Get my offers error:", error)
    return NextResponse.json({ error: "Failed to get offers" }, { status: 500 })
  }
}
