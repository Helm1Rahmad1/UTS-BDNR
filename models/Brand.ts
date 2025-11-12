import mongoose from "mongoose"

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  createdAt: { type: Date, default: Date.now },
})

brandSchema.index({ slug: 1 })

export default mongoose.models.Brand || mongoose.model("Brand", brandSchema)
