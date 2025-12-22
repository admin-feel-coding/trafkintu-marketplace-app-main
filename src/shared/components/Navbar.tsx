"use client"

import Link from "next/link"
import { Store, UserIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function Navbar() {
  const { user, isLoading, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Store className="h-6 w-6 text-primary" />
          <span>TRAFKINTU</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link href="/explore" className="text-sm font-medium hover:text-primary transition-colors">
            Explorar
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && !user && (
            <>
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href="/auth">Ingresar</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">Registrarse</Link>
              </Button>
            </>
          )}

          {!isLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start gap-1">
                    <span className="text-sm font-medium leading-none">{user.displayName}</span>
                    <Badge
                      variant={user.role === "pyme" ? "default" : "secondary"}
                      className="text-[10px] h-4 px-1.5 leading-none"
                    >
                      {user.role === "pyme" ? "PYME" : user.role === "admin" ? "Admin" : "Usuario"}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-none">{user.displayName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Mi perfil
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Store className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

{/* Mobile hamburger menu removed - using BottomNav instead */}
        </div>
      </div>
    </header>
  )
}
