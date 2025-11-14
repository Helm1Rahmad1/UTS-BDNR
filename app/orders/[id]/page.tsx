import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

async function getOrder(id: string) {
  try {
    await connectDB()
    const order = await Order.findById(id)
      .populate({
        path: "items.product",
        model: "Product",
      })
      .lean()

    if (!order) {
      notFound()
    }

    // Convert ObjectIds to strings
    return {
      ...order,
      _id: order._id.toString(),
      user: order.user?.toString(),
      items: order.items?.map((item: any) => ({
        ...item,
        product: item.product ? {
          ...item.product,
          _id: item.product._id.toString(),
          category: item.product.category?.toString(),
          brand: item.product.brand?.toString(),
          seller: item.product.seller?.toString(),
        } : null,
      })),
    }
  } catch (error) {
    console.error("Error fetching order:", error)
    notFound()
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order #{order._id.toString().slice(-8)}</h1>
        <Badge className={statusColor[order.status] as any}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.product?.images?.[0] || "/placeholder.svg?height=100&width=100"}
                      alt={item.product?.name || "Product"}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Size: {item.size} x {item.qty}
                    </p>
                    <p className="font-bold">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="text-sm space-y-2">
              <p className="font-semibold">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city} {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border border-border rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6 pb-6 border-b">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rp {(order.total - 50000 - Math.round((order.total - 50000) / 1.1)).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Rp 50.000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>
                Rp{" "}
                {Math.round((order.total - 50000 - Math.round((order.total - 50000) / 1.1)) * 0.1).toLocaleString(
                  "id-ID",
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-between mb-6 font-bold text-lg">
            <span>Total</span>
            <span>Rp {order.total.toLocaleString("id-ID")}</span>
          </div>

          <Link href="/products" className="w-full">
            <Button variant="outline" className="w-full bg-transparent">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
