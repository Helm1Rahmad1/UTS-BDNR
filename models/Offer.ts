import mongoose from "mongoose"

const offerSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  offerPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "DECLINED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
})

offerSchema.index({ product: 1, buyer: 1 })
offerSchema.index({ seller: 1, status: 1 })
offerSchema.index({ buyer: 1, status: 1 })

export default mongoose.models.Offer || mongoose.model("Offer", offerSchema)
