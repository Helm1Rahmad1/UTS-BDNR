"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, PackageSearch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"

interface Order {
  _id: string
  user: any
  items: any[]
  total: number
  status: string
  createdAt: string
}

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetch(`/api/dashboard/orders?page=${page}`, { credentials: "include" })
      const data = await res.json()
      if (!res.ok) {
        const friendly = res.status === 401 ? "You need admin access to view orders." : data?.error ?? "Failed to fetch orders"
        throw new Error(friendly)
      }

      if (!Array.isArray(data.orders)) {
        throw new Error("Orders data malformatted")
      }

      setOrders(data.orders)
      setPages(Number.isFinite(data.pages) ? data.pages : 1)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([])
      setPages(1)
      const fallback = error instanceof Error ? error.message : ""
      const friendly =
        fallback && fallback !== "Failed to fetch orders" && fallback !== "Orders data malformatted"
          ? fallback
          : "We couldn't load recent orders. Please try refreshing."
      setErrorMessage(friendly)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/dashboard/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })
      fetchOrders()
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {orders.length === 0 ? (
        <Empty className="border border-border bg-background/60">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageSearch className="size-5" />
            </EmptyMedia>
            <EmptyTitle>{errorMessage ? "Unable to load orders" : "No orders yet"}</EmptyTitle>
            <EmptyDescription>
              {errorMessage ?? "Orders from your customers will appear here once they start buying."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => fetchOrders()} variant="default">
              Refresh list
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {errorMessage && (
            <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {errorMessage}
            </div>
          )}

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left font-semibold">Items</th>
                  <th className="px-6 py-3 text-left font-semibold">Total</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-3 font-mono text-xs">{order._id.toString().slice(-8)}</td>
                    <td className="px-6 py-3">{order.user?.name}</td>
                    <td className="px-6 py-3">{order.items.length}</td>
                    <td className="px-6 py-3 font-semibold">Rp {order.total.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-3">
                      <Badge className={statusColor[order.status] as any}>{order.status}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="rounded border border-input px-2 py-1 text-xs"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded border ${
                    page === p ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
