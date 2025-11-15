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
import { Star, Heart, Share2, Store, ShieldCheck, Package, TrendingUp, Edit } from "lucide-react"

export default function ProductDetail({ product }: { product: any }) {
  const { data: session } = useSession()
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const isAdmin = session?.user?.role === "admin"

  const handleAddToCart = () => {
    const cartItem = {
      product: product._id,
      size: selectedSize,
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
  const isActive = product.listingStatus === "ACTIVE"

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
            {/* Product Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {product.listingStatus}
                  </Badge>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>
                {isAdmin && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/products?edit=${product._id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Product
                    </Link>
                  </Button>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground mb-4">
                {product.brand?.name} • {product.category?.name}
              </p>

              {/* Rating */}
              {product.ratingCount > 0 ? (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(product.avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {product.avgRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.ratingCount} reviews)
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">No reviews yet</p>
              )}

              {/* Price */}
              <p className="text-4xl font-bold mb-6">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </div>

            <Separator />

            {/* Seller Info Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {sellerInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{product.seller?.name || "Seller"}</h3>
                      <ShieldCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.seller?.email}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span>{product.sold || 0} sold</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3">Select Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded border-2 font-semibold transition-colors ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
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
                {isActive
                  ? `${product.stock} available`
                  : "Item sold out"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!isActive || product.stock === 0}
                size="lg"
                className="w-full"
              >
                {isActive ? "Add to Cart" : "Sold Out"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="flex-1">
                  <Heart className="h-5 w-5 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Product Stats */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Condition</span>
                  </div>
                  <span className="font-medium capitalize">{product.condition}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Total Sold</span>
                  </div>
                  <span className="font-medium">{product.sold || 0} items</span>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tags */}
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
          </div>
        </div>
      </div>
    </div>
  )
}
