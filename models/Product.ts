import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sizes: [{ type: String, enum: ["S", "M", "L", "XL"], required: true }],
  condition: { type: String, enum: ["new", "like-new", "used"], default: "used" },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 1 },
  sold: { type: Number, default: 0, min: 0 },
  listingStatus: { type: String, enum: ["ACTIVE", "SOLD"], default: "ACTIVE" },
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
})

productSchema.index({ name: "text", description: "text", tags: "text" })
productSchema.index({ category: 1, brand: 1, price: 1 })

export default mongoose.models.Product || mongoose.model("Product", productSchema)
