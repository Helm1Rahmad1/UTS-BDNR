"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Share2 } from "lucide-react"

export default function ProductDetail({ product }: { product: any }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg?height=500&width=500"}
              alt={product.name}
              width={500}
              height={500}
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
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="mb-4">
            <Badge>{product.condition}</Badge>
          </div>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-4">{product.category?.name}</p>

          {/* Rating */}
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">
                {product.avgRating.toFixed(1)} ({product.ratingCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <p className="text-3xl font-bold mb-6">Rp {product.price.toLocaleString("id-ID")}</p>

          {/* Description */}
          <p className="text-muted-foreground mb-6">{product.description}</p>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Size</h3>
            <div className="flex gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded border-2 font-semibold ${
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
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded border border-input hover:bg-muted"
              >
                -
              </button>
              <span className="font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 rounded border border-input hover:bg-muted"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock */}
          <p className="text-sm mb-6 text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Add to Cart */}
          <div className="flex gap-4 mb-8">
            <Button onClick={handleAddToCart} disabled={product.stock === 0} size="lg" className="flex-1">
              Add to Cart
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Related */}
          <div className="pt-8 border-t">
            <h3 className="font-semibold mb-4">More from {product.brand?.name}</h3>
            <p className="text-sm text-muted-foreground">Browse other products from this brand</p>
          </div>
        </div>
      </div>
    </div>
  )
}
