"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, ImagePlus, Loader2, UploadCloud, X } from "lucide-react"

interface ProductFormProps {
  product?: any
  onSuccess: () => void
}

interface ReferenceOption {
  _id: string
  name: string
}

const sizeOptions = ["S", "M", "L", "XL"] as const

const initialFormState = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  condition: "used",
  category: "",
  brand: "",
  sizes: ["M"],
  images: [""],
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ReferenceOption[]>([])
  const [brands, setBrands] = useState<ReferenceOption[]>([])
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [brandOpen, setBrandOpen] = useState(false)
  const [brandSearch, setBrandSearch] = useState("")
  const [creatingBrand, setCreatingBrand] = useState(false)
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null)
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    if (product) {
      setEditingId(product._id ?? null)
      setFormData({
        name: product.name ?? "",
        description: product.description ?? "",
        price: product.price ?? 0,
        stock: product.stock ?? 0,
        condition: product.condition ?? "used",
        category: product.category?._id || product.category || "",
        brand: product.brand?._id || product.brand || "",
        sizes: Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["M"],
        images: Array.isArray(product.images) && product.images.length ? product.images : [""],
      })
    } else {
      setEditingId(null)
      setFormData(initialFormState)
    }
  }, [product])

  useEffect(() => {
    if (!brandOpen) {
      setBrandSearch("")
    }
  }, [brandOpen])

  const fetchOptions = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch("/api/dashboard/categories"),
        fetch("/api/dashboard/brands"),
      ])

      if (!catRes.ok) {
        throw new Error("Failed to fetch categories")
      }
      if (!brandRes.ok) {
        throw new Error("Failed to fetch brands")
      }

      const [cats, bnds] = await Promise.all([catRes.json(), brandRes.json()])

      setCategories(Array.isArray(cats) ? cats : [])
      setBrands(Array.isArray(bnds) ? bnds : [])
    } catch (error) {
      console.error("Error fetching options:", error)
    }
  }

  const selectedCategory = categories.find((cat) => cat._id === formData.category)
  const selectedBrand = brands.find((brand) => brand._id === formData.brand)
  const trimmedBrandSearch = brandSearch.trim()
  const showCreateBrandOption =
    trimmedBrandSearch.length > 0 &&
    !brands.some((brand) => brand.name.toLowerCase() === trimmedBrandSearch.toLowerCase())

  const handleImageChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.images]
      updated[index] = value
      return { ...prev, images: updated }
    })
  }

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }))
  }

  const removeImageField = (index: number) => {
    setFormData((prev) => {
      if (prev.images.length === 1) return prev
      const updated = prev.images.filter((_, i) => i !== index)
      return { ...prev, images: updated }
    })
  }

  const triggerFileDialog = (index: number) => {
    setActiveUploadIndex(index)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
      fileInputRef.current.click()
    }
  }

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || activeUploadIndex === null) {
      return
    }

    setUploadingImageIndex(activeUploadIndex)
    setUploadError(null)

    try {
      const data = new FormData()
      data.append("file", file)

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error ?? "Failed to upload image")
      }

      const result = await response.json()
      if (!result?.url) {
        throw new Error("Upload did not return a file URL")
      }

      handleImageChange(activeUploadIndex, result.url)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setUploadingImageIndex(null)
      setActiveUploadIndex(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size)
      const updated = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size]
      return { ...prev, sizes: updated.length ? updated : [size] }
    })
  }

  const handleCreateBrand = async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    setCreatingBrand(true)
    try {
      const response = await fetch("/api/dashboard/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error ?? "Failed to create brand")
      }

      const newBrand = await response.json()
      if (!newBrand?._id) {
        throw new Error("Invalid brand response")
      }

      setBrands((prev) =>
        [...prev.filter((brand) => brand._id !== newBrand._id), newBrand].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      )
      setFormData((prev) => ({ ...prev, brand: newBrand._id }))
      setBrandOpen(false)
      setBrandSearch("")
    } catch (error) {
      console.error("Create brand error:", error)
    } finally {
      setCreatingBrand(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)

    try {
      const method = editingId ? "PATCH" : "POST"
      const url = editingId ? `/api/dashboard/products/${editingId}` : "/api/dashboard/products"

      const cleanedImages = formData.images.map((image) => image.trim()).filter(Boolean)
      const payload = {
        ...formData,
        images: cleanedImages.length ? cleanedImages : ["/placeholder.svg?height=500&width=500"],
        sizes: formData.sizes.length ? formData.sizes : ["M"],
        ...(editingId ? { _id: editingId } : {}),
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error ?? "Failed to save product")
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving product:", error)
      setFormError(error instanceof Error ? error.message : "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Basic details</p>
            <h3 className="text-lg font-semibold">Content</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  min={0}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  min={0}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Metadata</p>
            <h3 className="text-lg font-semibold">Catalog</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full justify-between"
                  >
                    {selectedCategory ? selectedCategory.name : "Search category"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-64 overflow-hidden rounded-lg border p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." className="h-9" />
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {categories.map((cat) => (
                          <CommandItem
                            key={cat._id}
                            value={cat.name}
                            onSelect={() => {
                              setFormData((prev) => ({ ...prev, category: cat._id }))
                              setCategoryOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.category === cat._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cat.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Brand</label>
              <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={brandOpen}
                    className="w-full justify-between"
                  >
                    {selectedBrand ? selectedBrand.name : "Search or create brand"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-64 overflow-hidden rounded-lg border p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search brands..."
                      className="h-9"
                      value={brandSearch}
                      onValueChange={setBrandSearch}
                    />
                    <CommandEmpty>No brand found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {brands.map((brand) => (
                          <CommandItem
                            key={brand._id}
                            value={brand.name}
                            onSelect={() => {
                              setFormData((prev) => ({ ...prev, brand: brand._id }))
                              setBrandOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.brand === brand._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {brand.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {showCreateBrandOption && (
                          <>
                            <CommandSeparator />
                            <CommandGroup heading="Actions">
                              <CommandItem
                                value={`create-${trimmedBrandSearch}`}
                                disabled={creatingBrand}
                                onSelect={() => handleCreateBrand(trimmedBrandSearch)}
                              >
                                {creatingBrand ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <UploadCloud className="mr-2 h-4 w-4" />
                                )}
                                Add &quot;{trimmedBrandSearch}&quot;
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Available sizes</label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "w-12 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                      formData.sizes.includes(size)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input text-muted-foreground hover:border-primary"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-2xl border border-dashed border-border bg-background p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Media</p>
            <h3 className="text-lg font-semibold">Images</h3>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addImageField}>
            <ImagePlus className="mr-2 h-4 w-4" /> Add slot
          </Button>
        </div>
        <div className="space-y-3">
          {formData.images.map((image, index) => (
            <div
              key={`image-${index}`}
              className="flex flex-col gap-4 rounded-xl border border-input/60 bg-card/40 p-3 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-full overflow-hidden rounded-lg bg-muted sm:w-32">
                {image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={image} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://..."
                  inputMode="url"
                  autoComplete="url"
                  className="w-full rounded-lg border border-input px-3 py-2 text-sm"
                  required={index === 0}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => triggerFileDialog(index)}
                    disabled={uploadingImageIndex === index}
                  >
                    {uploadingImageIndex === index ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="mr-2 h-4 w-4" />
                    )}
                    {uploadingImageIndex === index ? "Uploading..." : "Upload"}
                  </Button>
                  {formData.images.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImageField(index)}
                    >
                      <X className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </section>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Saving..." : "Save Product"}
      </Button>
    </form>
  )
}
