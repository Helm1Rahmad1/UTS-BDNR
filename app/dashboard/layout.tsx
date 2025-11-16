"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Tag, ShoppingCart, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/products", icon: Package, label: "Products" },
  { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/30">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Admin</h2>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border text-sm text-muted-foreground">
            Press the brand logo in the header to return to the storefront.
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
