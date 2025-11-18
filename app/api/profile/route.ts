import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { writeFile, unlink } from "fs/promises"
import path from "path"

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id).select("-passwordHash")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, phone, bio, currentPassword, newPassword } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update basic fields
    user.name = name
    user.phone = phone
    user.bio = bio
    user.updatedAt = new Date()

    // Handle password change if provided
    if (currentPassword && newPassword) {
      const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.passwordHash)

      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
      }

      user.passwordHash = newPassword // Will be hashed by pre-save middleware
    }

    await user.save()

    // Return updated user without password
    const updatedUser = await User.findById(user._id).select("-passwordHash")

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}