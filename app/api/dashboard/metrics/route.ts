import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Top-selling per kategori (agregasi)
    const topSellingByCategory = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          totalSold: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ])

    // Revenue metrics
    const revenueMetrics = await Order.aggregate([
      { $match: { status: "PAID" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          averageOrder: { $avg: "$total" },
        },
      },
    ])

    // Top brands
    const topBrands = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "brands",
          localField: "product.brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$brand" },
      {
        $group: {
          _id: "$brand.name",
          totalSold: { $sum: "$items.qty" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ])

    // Product stats
    const totalProducts = await Product.countDocuments()
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } })

    return NextResponse.json({
      topSellingByCategory,
      revenueMetrics: revenueMetrics[0] || { totalRevenue: 0, totalOrders: 0 },
      topBrands,
      totalProducts,
      lowStockProducts,
    })
  } catch (error) {
    console.error("Metrics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
