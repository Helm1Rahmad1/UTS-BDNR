"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"
import { ArrowRight, Loader2, ShoppingBag } from "lucide-react"

interface Order {
  _id: string
  total: number
  status: string
  createdAt: string
  items: any[]
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetch(`/api/orders?page=${page}`, { credentials: "include" })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to fetch orders")
      }

      if (!Array.isArray(data.orders)) {
        throw new Error("Orders data malformed")
      }

      setOrders(data.orders)
      setPages(Number.isFinite(data.pages) ? data.pages : 1)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([])
      setPages(1)
      const fallback = error instanceof Error ? error.message : ""
      const friendly =
        fallback && fallback !== "Failed to fetch orders" && fallback !== "Orders data malformed"
          ? fallback
          : "We couldn't reach your orders. Please try again shortly."
      setErrorMessage(friendly)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/auth/login")
      return
    }

    fetchOrders()
  }, [router, session, fetchOrders])

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  if (loading || orders === null) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <Empty className="border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBag className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No orders yet</EmptyTitle>
            <EmptyDescription>
              {errorMessage ?? "You haven't placed any orders yet. Start shopping and your purchases will appear here."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="lg" className="h-12 px-10 text-base font-semibold shadow-lg shadow-primary/40">
              <Link href="/products" className="inline-flex items-center gap-2">
                Start shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {errorMessage && (
        <div className="mb-6 rounded border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order._id}
            className="p-4 hover:border-primary cursor-pointer transition"
            onClick={() => router.push(`/orders/${order._id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold">Order #{order._id.toString().slice(-8)}</p>
                <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
              </div>
              <Badge className={statusColor[order.status] as any}>{order.status}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{order.items.length} items</p>
              </div>
              <p className="font-bold">Rp {order.total.toLocaleString("id-ID")}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
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
    </div>
  )
}
