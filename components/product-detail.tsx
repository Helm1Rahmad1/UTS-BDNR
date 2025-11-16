"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Heart, Share2, ShieldCheck, Store, Edit, MessageCircle, MapPin } from "lucide-react"

export default function ProductDetail({ product }: { product: any }) {
  const { data: session } = useSession()
  const sizeOptions = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["One Size"]
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const isAdmin = session?.user?.role === "admin"
  const isActive = product.listingStatus === "ACTIVE"

  const handleAddToCart = () => {
    const cartItem = {
      product: product._id,
      size: selectedSize || sizeOptions[0],
      qty: quantity,
      priceAtAdd: product.price,
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.product === product._id && item.size === selectedSize)

    if (existingItem) {
      existingItem.qty += quantity
    } else {
      cart.push(cartItem)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    alert("Added to cart!")
  }

  const sellerInitial = product.seller?.name?.charAt(0).toUpperCase() || "S"
  const sellerLocation =
    [product.seller?.location?.city || product.seller?.city, product.seller?.location?.country || product.seller?.country]
      .filter(Boolean)
      .join(", ") || "Location not provided"

  const conditionLabel = product.condition ? product.condition.replace(/-/g, " ").toUpperCase() : "-"

  const highlightItems = [
    { label: "Category", value: product.category?.name ?? "-" },
    { label: "Brand", value: product.brand?.name ?? "-" },
    { label: "Condition", value: conditionLabel },
    { label: "Listing Status", value: product.listingStatus ?? "-" },
    { label: "Stock", value: `${product.stock ?? 0} pcs` },
    { label: "Available Sizes", value: sizeOptions.join(", ") },
  ]

  const handleMessageSeller = () => {
    if (product.seller?.email) {
      window.location.href = `mailto:${product.seller.email}?subject=${encodeURIComponent(`Question about ${product.name}`)}`
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Images - Left Column */}
        <div className="lg:col-span-2">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === idx ? "border-primary" : "border-border"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${idx + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info & Actions - Right Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isActive ? "default" : "secondary"}>{product.listingStatus}</Badge>
                  <Badge variant="outline" className="capitalize">
                    {product.condition}
                  </Badge>
                </div>
                {isAdmin && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/products?edit=${product._id}`}>
                      <Edit className="h-4 w-4 mr-2" /> Edit Product
                    </Link>
                  </Button>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-muted-foreground">
                  {product.brand?.name ?? "Unknown Brand"} • {product.category?.name ?? "Uncategorized"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 rounded border px-3 py-2 text-sm font-semibold transition ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded border border-input hover:bg-muted transition-colors"
                  >
                    -
                  </button>
                  <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!isActive}
                    className="h-10 w-10 rounded border border-input hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm mt-2 text-muted-foreground">
                  {isActive ? `${product.stock} available` : "Item sold out"}
                </p>
              </div>

              <p className="text-4xl font-bold">Rp {product.price.toLocaleString("id-ID")}</p>

              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!isActive || product.stock === 0}
                    className="flex-1 h-12 text-base font-semibold"
                  >
                    {isActive ? "Purchase Now" : "Sold Out"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold"
                    onClick={handleMessageSeller}
                    disabled={!product.seller?.email}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> Message Seller
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1">
                    <Heart className="h-5 w-5 mr-2" /> Save
                  </Button>
                  <Button variant="ghost" className="flex-1">
                    <Share2 className="h-5 w-5 mr-2" /> Share
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Product Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {highlightItems.map((item) => (
                  <div key={item.label} className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="text-base font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-muted text-muted-foreground">{sellerInitial}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{product.seller?.name || "Seller"}</h3>
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <span>{product.sold || 0} sold</span>
                      </div>
                      {product.ratingCount > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{product.avgRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({product.ratingCount} reviews)</span>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No reviews yet</div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{sellerLocation}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground truncate">{product.seller?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
