"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Loader2, PackageSearch } from "lucide-react"
import ProductForm from "@/components/dashboard/product-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get("edit")

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetch(`/api/dashboard/products?page=${page}`, {
        credentials: "include",
        cache: "no-store",
      })
      const data = await res.json()

      if (!res.ok) {
        const friendly = res.status === 401 ? "You need admin access to manage products." : data?.error ?? "Failed to fetch products"
        throw new Error(friendly)
      }

      if (!Array.isArray(data.products)) {
        throw new Error("Products data malformed")
      }

      setProducts(data.products)
      setPages(Number.isFinite(data.pages) ? data.pages : 1)
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
      setPages(1)
      const fallback = error instanceof Error ? error.message : ""
      const friendly =
        fallback && fallback !== "Failed to fetch products" && fallback !== "Products data malformed"
          ? fallback
          : "We couldn't load your catalog right now. Please try refreshing."
      setErrorMessage(friendly)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    if (!editId) return

    const existing = products.find((product) => product._id === editId)
    if (existing) {
      setSelectedProduct(existing)
      setOpenDialog(true)
      return
    }

    let ignore = false
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/dashboard/products/${editId}`, {
          credentials: "include",
          cache: "no-store",
        })
        if (!res.ok) {
          throw new Error("Failed to fetch product")
        }
        const data = await res.json()
        if (!ignore) {
          setSelectedProduct(data)
          setOpenDialog(true)
        }
      } catch (error) {
        console.error("Error loading product for edit:", error)
      }
    }

    fetchProduct()

    return () => {
      ignore = true
    }
  }, [editId, products])

  const clearEditParam = useCallback(() => {
    if (!editId) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete("edit")
    const queryString = params.toString()
    router.replace(`/dashboard/products${queryString ? `?${queryString}` : ""}`, { scroll: false })
  }, [editId, router, searchParams])

  const handleDialogChange = useCallback(
    (open: boolean) => {
      setOpenDialog(open)
      if (!open) {
        setSelectedProduct(null)
        clearEditParam()
      }
    },
    [clearEditParam]
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      await fetch(`/api/dashboard/products/${id}`, { method: "DELETE", credentials: "include" })
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button
          onClick={() => {
            clearEditParam()
            setSelectedProduct(null)
            setOpenDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <Empty className="border border-border bg-background/60">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageSearch className="size-5" />
                </EmptyMedia>
                <EmptyTitle>{errorMessage ? "Unable to load products" : "No products yet"}</EmptyTitle>
                <EmptyDescription>
                  {errorMessage ?? "Add your first product to start selling."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  onClick={() => {
                    clearEditParam()
                    setSelectedProduct(null)
                    setOpenDialog(true)
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add product
                </Button>
                <Button variant="outline" onClick={() => fetchProducts()} className="w-full">
                  Refresh list
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {errorMessage}
                </div>
              )}

              {/* Mobile card list */}
              <div className="grid gap-4 md:hidden mb-6">
                {products.map((product: any) => (
                  <Card key={product._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold leading-tight">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Rp {product.price.toLocaleString("id-ID")}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{product.condition}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Stock: {product.stock}</span>
                      <span>Sold: {product.sold ?? 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedProduct(product)
                          setOpenDialog(true)
                        }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(product._id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Price</th>
                      <th className="px-6 py-3 text-left font-semibold">Stock</th>
                      <th className="px-6 py-3 text-left font-semibold">Condition</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => (
                      <tr key={product._id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-6 py-3">{product.name}</td>
                        <td className="px-6 py-3">Rp {product.price.toLocaleString("id-ID")}</td>
                        <td className="px-6 py-3">{product.stock}</td>
                        <td className="px-6 py-3 capitalize">{product.condition}</td>
                        <td className="px-6 py-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product)
                              setOpenDialog(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(product._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  Previous
                </Button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={page === p ? "default" : "outline"} onClick={() => setPage(p)}>
                    {p}
                  </Button>
                ))}
                <Button variant="outline" onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages}>
                  Next
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <ProductForm
              product={selectedProduct}
              onSuccess={() => {
                handleDialogChange(false)
                fetchProducts()
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
