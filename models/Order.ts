import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      size: { type: String, enum: ["S", "M", "L", "XL"], required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "PAID", "CANCELLED"], default: "PENDING" },
  paymentId: String,
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Order || mongoose.model("Order", orderSchema)
