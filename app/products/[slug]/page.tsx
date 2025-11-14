import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductDetail from "@/components/product-detail"
import ProductReviews from "@/components/product-reviews"
import { notFound } from "next/navigation"

async function getProduct(slug: string) {
  try {
    await connectDB()
    const product = await Product.findOne({ slug }).populate("category").populate("brand").lean()

    if (!product) {
      notFound()
    }

    // Convert ObjectIds to strings for Client Components
    return {
      ...product,
      _id: product._id.toString(),
      category: product.category ? {
        ...product.category,
        _id: product.category._id.toString(),
      } : null,
      brand: product.brand ? {
        ...product.brand,
        _id: product.brand._id.toString(),
      } : null,
      seller: product.seller?.toString(),
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  return (
    <div>
      <ProductDetail product={product} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t">
        <ProductReviews productId={product._id.toString()} />
      </div>
    </div>
  )
}
