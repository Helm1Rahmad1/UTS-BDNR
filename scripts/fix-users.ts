import mongoose from "mongoose"
import User from "../models/User"

const MONGODB_URI = process.env.MONGODB_URI!

async function fixUsers() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined")
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Update all users that don't have updatedAt field
    const result = await User.updateMany(
      { 
        $or: [
          { updatedAt: { $exists: false } },
          { updatedAt: null }
        ]
      },
      { 
        $set: { 
          updatedAt: new Date()
        }
      }
    )

    console.log(`Updated ${result.modifiedCount} users`)

    // Verify all users have proper timestamps
    const users = await User.find({})
    console.log(`Total users: ${users.length}`)
    
    for (const user of users) {
      if (!user.createdAt || !user.updatedAt) {
        console.log(`Fixing user ${user.email}: createdAt=${user.createdAt}, updatedAt=${user.updatedAt}`)
        user.createdAt = user.createdAt || new Date()
        user.updatedAt = user.updatedAt || user.createdAt || new Date()
        await user.save()
      }
    }

    console.log("✅ All users fixed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Fix users error:", error)
    process.exit(1)
  }
}

fixUsers()