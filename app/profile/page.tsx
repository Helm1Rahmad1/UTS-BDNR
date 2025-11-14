import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, User, Shield, Calendar } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{session.user?.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={session.user?.role === "admin" ? "default" : "secondary"}>
                        {session.user?.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{session.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>User ID: {session.user?.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Role: {session.user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/orders">
                <Calendar className="mr-2 h-4 w-4" />
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/cart">
                <Shield className="mr-2 h-4 w-4" />
                Go to Cart
              </Link>
            </Button>
            {session.user?.role === "admin" && (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Reviews Written</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
