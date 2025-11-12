"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CartItem {
  product: any
  size: string
  qty: number
  priceAtAdd: number
}

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const loadCart = async () => {
      // Load from localStorage (for guests)
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]")

      if (session?.user?.id) {
        // Sync local cart to DB and fetch from DB
        if (localCart.length > 0) {
          try {
            setSyncing(true)
            await fetch("/api/cart/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: localCart }),
            })
            localStorage.removeItem("cart")
          } catch (error) {
            console.error("Sync error:", error)
          } finally {
            setSyncing(false)
          }
        }

        // Fetch from DB
        try {
          const res = await fetch("/api/cart/sync")
          const data = await res.json()
          setItems(data.items || [])
        } catch (error) {
          console.error("Fetch cart error:", error)
        }
      } else {
        setItems(localCart)
      }

      setLoading(false)
    }

    loadCart()
  }, [session])

  const updateQuantity = (idx: number, qty: number) => {
    if (qty < 1) return
    const updated = [...items]
    updated[idx].qty = qty
    setItems(updated)
    updateLocalCart(updated)
  }

  const removeItem = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx)
    setItems(updated)
    updateLocalCart(updated)
  }

  const updateLocalCart = async (updatedItems: CartItem[]) => {
    if (session?.user?.id) {
      try {
        setSyncing(true)
        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: updatedItems }),
        })
      } catch (error) {
        console.error("Sync error:", error)
      } finally {
        setSyncing(false)
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(updatedItems))
    }
  }

  const total = items.reduce((sum, item) => sum + item.priceAtAdd * item.qty, 0)

  if (loading || syncing) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-muted-foreground mb-8">Your cart is empty</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 border border-border rounded-lg p-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                  <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                  <p className="text-lg font-bold mt-2">Rp {item.priceAtAdd.toLocaleString("id-ID")}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(idx, item.qty - 1)}
                      className="h-8 w-8 rounded border border-input hover:bg-muted text-center flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(idx, item.qty + 1)}
                      className="h-8 w-8 rounded border border-input hover:bg-muted text-center flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <button onClick={() => removeItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border border-border rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6 pb-6 border-b border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Rp 50.000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>Rp {Math.round(total * 0.1).toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="flex justify-between mb-6 text-lg font-bold">
            <span>Total</span>
            <span>Rp {(total + 50000 + Math.round(total * 0.1)).toLocaleString("id-ID")}</span>
          </div>

          {session ? (
            <Link href="/checkout" className="w-full">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          ) : (
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Sign In to Checkout</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
