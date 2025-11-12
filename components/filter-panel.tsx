"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function FilterPanel({
  categories,
  brands,
}: {
  categories: any[]
  brands: any[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeFilters = {
    category: searchParams.get("category"),
    brand: searchParams.get("brand"),
    size: searchParams.get("size"),
    condition: searchParams.get("condition"),
  }

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/products")
  }

  const conditions = ["new", "like-new", "used"]
  const sizes = ["S", "M", "L", "XL"]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Active Filters</h3>
        {Object.values(activeFilters).some((v) => v) ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(
              ([key, value]) =>
                value && (
                  <Badge key={key} variant="secondary" className="flex gap-2">
                    {value}
                    <button onClick={() => updateFilter(key, null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ),
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">
              Clear All
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No filters applied</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold mb-2">Condition</h4>
        <div className="space-y-2">
          {conditions.map((condition) => (
            <button
              key={condition}
              onClick={() => updateFilter("condition", activeFilters.condition === condition ? null : condition)}
              className={`block w-full text-left px-3 py-2 rounded text-sm ${
                activeFilters.condition === condition ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {condition.charAt(0).toUpperCase() + condition.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Size</h4>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => updateFilter("size", activeFilters.size === size ? null : size)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                activeFilters.size === size
                  ? "bg-primary text-primary-foreground"
                  : "border border-input hover:bg-muted"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
