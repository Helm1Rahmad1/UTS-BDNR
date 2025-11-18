import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { auth } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import path from "path"

// POST - Upload avatar
export async function POST(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 5MB" 
      }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        const oldAvatarPath = path.join(process.cwd(), "public", user.avatar)
        await unlink(oldAvatarPath)
        console.log("Deleted old avatar:", oldAvatarPath)
      } catch (error) {
        console.log("Could not delete old avatar (file may not exist):", error)
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `avatar-${session.user.id}-${timestamp}${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
    
    try {
      const { mkdir } = await import("fs/promises")
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.log("Directory already exists or could not be created:", error)
    }

    // Save file
    const filePath = path.join(uploadDir, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Update user avatar path
    const avatarUrl = `/uploads/avatars/${fileName}`
    user.avatar = avatarUrl
    user.updatedAt = new Date()
    await user.save()

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatar: avatarUrl,
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 })
  }
}

// DELETE - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete avatar file if exists
    if (user.avatar) {
      try {
        const avatarPath = path.join(process.cwd(), "public", user.avatar)
        await unlink(avatarPath)
        console.log("Deleted avatar:", avatarPath)
      } catch (error) {
        console.log("Could not delete avatar file:", error)
      }

      // Remove avatar from user record
      user.avatar = undefined
      user.updatedAt = new Date()
      await user.save()
    }

    return NextResponse.json({
      message: "Avatar removed successfully",
    })
  } catch (error) {
    console.error("Avatar delete error:", error)
    return NextResponse.json({ error: "Failed to remove avatar" }, { status: 500 })
  }
}