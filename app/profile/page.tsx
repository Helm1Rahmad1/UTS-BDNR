import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import Order from "@/models/Order"
import Review from "@/models/Review"
import ProfileForm from "@/components/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Shield, ShoppingBag } from "lucide-react"
import Link from "next/link"

async function getUserProfile(userId: string) {
  try {
    await connectDB()
    
    const user = await User.findById(userId).select("-passwordHash").lean()
    const orderCount = await Order.countDocuments({ user: userId })
    const reviewCount = await Review.countDocuments({ user: userId })

    if (!user) {
      return null
    }

    const userObj = user.toObject ? user.toObject() : user
    return {
      user: {
        ...userObj,
        _id: user._id.toString(),
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || user.createdAt?.toISOString() || new Date().toISOString(),
      },
      stats: {
        orderCount,
        reviewCount,
      }
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const profileData = await getUserProfile(session.user.id)

  if (!profileData) {
    redirect("/auth/login")
  }

  const { user, stats } = profileData

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and settings</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Form */}
        <ProfileForm initialData={user} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/orders">
                <Calendar className="mr-2 h-4 w-4" />
                View My Orders ({stats.orderCount})
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/cart">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Go to Cart
              </Link>
            </Button>
            {user.role === "admin" && (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.orderCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Reviews Written</p>
                <p className="text-2xl font-bold">{stats.reviewCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
