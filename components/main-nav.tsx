"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, Home, Menu, Package, Settings, ShoppingCart, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: "/", label: "ダッシュボード", icon: <Home className="w-4 h-4 mr-2" /> },
    { href: "/sales", label: "売上管理", icon: <BarChart3 className="w-4 h-4 mr-2" /> },
    { href: "/products", label: "製品管理", icon: <Package className="w-4 h-4 mr-2" /> },
    { href: "/purchases", label: "仕入れ管理", icon: <ShoppingCart className="w-4 h-4 mr-2" /> },
    { href: "/salespersons", label: "販売者管理", icon: <Users className="w-4 h-4 mr-2" /> },
    { href: "/reports", label: "レポート", icon: <FileText className="w-4 h-4 mr-2" /> },
    { href: "/settings", label: "設定", icon: <Settings className="w-4 h-4 mr-2" /> },
  ]

  return (
    <div className="mr-4 flex items-center">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">売上管理</span>
        <span className="inline-block font-bold sm:hidden">売上</span>
      </Link>

      {/* デスクトップナビゲーション */}
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-primary flex items-center text-sm",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* モバイルナビゲーション */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col space-y-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg">売上管理</span>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center py-2 px-3 rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted hover:text-primary text-muted-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
