import { type NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import crypto from "crypto"
import { auth } from "@/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth(request)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png"
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`
    const filePath = join(uploadsDir, filename)

    await writeFile(filePath, buffer)

    const url = `/uploads/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
