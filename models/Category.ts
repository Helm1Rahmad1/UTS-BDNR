import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  createdAt: { type: Date, default: Date.now },
})

categorySchema.index({ slug: 1 })

export default mongoose.models.Category || mongoose.model("Category", categorySchema)
