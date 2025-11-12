"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

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
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/auth/login")
      return
    }

    fetchOrders()
  }, [session, page, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?page=${page}`)
      const data = await res.json()
      setOrders(data.orders)
      setPages(data.pages)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-muted-foreground mb-8">You haven't placed any orders yet</p>
        <Link href="/products" className="text-primary hover:underline">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

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
