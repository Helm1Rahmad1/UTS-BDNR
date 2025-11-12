"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export default function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group cursor-pointer overflow-hidden rounded-lg border border-border">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0] || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary">{product.condition}</Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.category?.name}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold">Rp {product.price.toLocaleString("id-ID")}</p>
            {product.ratingCount > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
