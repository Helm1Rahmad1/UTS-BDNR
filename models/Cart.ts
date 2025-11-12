import mongoose from "mongoose"

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      size: { type: String, enum: ["S", "M", "L", "XL"], required: true },
      qty: { type: Number, required: true, min: 1 },
      priceAtAdd: { type: Number, required: true },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema)
