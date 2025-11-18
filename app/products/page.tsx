"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import FilterPanel from "@/components/filter-panel"
import { Loader2, Filter } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const q = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const brand = searchParams.get("brand") || ""
  const size = searchParams.get("size") || ""
  const condition = searchParams.get("condition") || ""
  const sort = searchParams.get("sort") || "-createdAt"

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          q,
          category,
          brand,
          size,
          condition,
          sort,
          page: currentPage.toString(),
          limit: "12",
        })

        const res = await fetch(`/api/products?${queryParams}`, { cache: "no-store" })
        const data = await res.json()
        setProducts(data.products)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [q, category, brand, size, condition, sort, currentPage])

  // Fetch categories and brands for filters
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ])
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }
        
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          setBrands(brandsData)
        }
      } catch (error) {
        console.error("Error fetching filters data:", error)
      }
    }

    fetchFiltersData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [q, category, brand, size, condition, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        <select
          value={sort}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams)
            params.set('sort', e.target.value)
            window.history.replaceState({}, '', `/products?${params.toString()}`)
          }}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
          <option value="-name">Name: Z to A</option>
        </select>
      </div>

      <div className="flex gap-8">
        {/* Filter Panel - Desktop */}
        <div className="hidden lg:block w-64">
          <FilterPanel categories={categories} brands={brands} />
        </div>

        {/* Products */}
        <div className="flex-1">
          {/* Filter Panel - Mobile */}
          <div className="lg:hidden mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <FilterPanel categories={categories} brands={brands} />
              </SheetContent>
            </Sheet>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
