import { Schema, model, models } from "mongoose"
import bcryptjs from "bcryptjs"

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  phone: { type: String },
  bio: { type: String, maxLength: 500 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next()
  try {
    const salt = await bcryptjs.genSalt(10)
    this.passwordHash = await bcryptjs.hash(this.passwordHash, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

export default models.User || model("User", userSchema)
