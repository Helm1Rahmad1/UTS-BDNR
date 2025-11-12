"use client"

import type React from "react"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, Search, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            ThriftStyle
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
            <Link href="/products" className="text-sm font-medium hover:text-primary">
              Browse
            </Link>
            {session?.user?.role === "admin" && (
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
            )}
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            {session ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">{session.user?.name}</span>
                <Button onClick={() => signOut()} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button size="sm">Sign In</Button>
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
              <Link href="/products" className="text-sm font-medium">
                Browse
              </Link>
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
