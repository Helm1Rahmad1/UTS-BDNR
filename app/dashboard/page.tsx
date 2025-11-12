"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface Metrics {
  topSellingByCategory: Array<{ _id: string; totalSold: number; revenue: number }>
  revenueMetrics: { totalRevenue: number; totalOrders: number }
  topBrands: Array<{ _id: string; totalSold: number }>
  totalProducts: number
  lowStockProducts: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/dashboard/metrics")
        const data = await res.json()
        setMetrics(data)
      } catch (error) {
        console.error("Error fetching metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">Rp {metrics?.revenueMetrics?.totalRevenue?.toLocaleString("id-ID")}</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">Total Orders</p>
          <p className="text-2xl font-bold">{metrics?.revenueMetrics?.totalOrders}</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">Total Products</p>
          <p className="text-2xl font-bold">{metrics?.totalProducts}</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-red-600">{metrics?.lowStockProducts}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Categories */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top Selling Categories</h2>
          <div className="space-y-3">
            {metrics?.topSellingByCategory?.map((cat) => (
              <div key={cat._id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{cat._id}</span>
                  <span className="text-sm">{cat.totalSold} sold</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${
                        (cat.totalSold / Math.max(...(metrics?.topSellingByCategory?.map((c) => c.totalSold) || [1]))) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Brands */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top Brands</h2>
          <div className="space-y-3">
            {metrics?.topBrands?.map((brand) => (
              <div key={brand._id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{brand._id}</span>
                  <span className="text-sm">{brand.totalSold} sold</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${
                        (brand.totalSold / Math.max(...(metrics?.topBrands?.map((b) => b.totalSold) || [1]))) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
