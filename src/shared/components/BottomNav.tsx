"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, User, LayoutDashboard, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/hooks/useAuth"

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const baseItems: NavItem[] = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/explore", icon: Search, label: "Explorar" },
  ]

  const roleItems: NavItem[] = []

  if (user?.role === "pyme") {
    roleItems.push({ href: "/dashboard", icon: LayoutDashboard, label: "Panel" })
  }

  if (user?.role === "admin") {
    roleItems.push({ href: "/admin", icon: Shield, label: "Admin" })
  }

  const profileItem: NavItem = user
    ? { href: "/profile", icon: User, label: "Perfil" }
    : { href: "/auth", icon: User, label: "Entrar" }

  const navItems = [...baseItems, ...roleItems, profileItem]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] touch-active",
                "text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
