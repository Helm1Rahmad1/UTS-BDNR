"use client"

import type React from "react"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, Search, Menu, X, User, Package, LogOut, Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="relative text-2xl font-black tracking-tight text-foreground group overflow-hidden"
          >
            <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full group-hover:skew-x-3">
              ThriftStyle
            </span>
            <span className="absolute left-0 top-full inline-block text-2xl font-black text-foreground transition-transform duration-300 group-hover:-translate-y-full group-hover:-skew-x-3">
              ThriftStyle
            </span>
            <span className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 group-hover:animate-[pulse_0.8s_ease-in-out] bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden flex-1 mx-8 md:flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-4 md:flex">
            {session?.user?.role === "admin" && (
              <Button asChild variant="ghost" size="sm" className="gap-2 text-foreground hover:bg-foreground/20">
                <Link href="/dashboard">
                  <Settings className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="gap-2 text-foreground hover:bg-foreground/20">
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
              </Link>
            </Button>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 group text-foreground hover:bg-foreground/20">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground group-hover:text-foreground/80">{session.user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {session?.user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button size="sm" className="shadow-sm hover:shadow-md">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
            <div className="flex flex-col gap-2">
              <Link href="/cart" className="text-sm font-medium">
                Cart
              </Link>
              {session?.user?.role === "admin" && (
                <Link href="/dashboard" className="text-sm font-medium">
                  Dashboard
                </Link>
              )}
              {session ? (
                <Button onClick={() => signOut()} variant="outline" size="sm" className="w-full">
                  Sign Out
                </Button>
              ) : (
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
