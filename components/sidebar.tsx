"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, BarChart, Settings, LogOut, Sun, Moon, User, Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import { toast } from "react-toastify"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Products",
      icon: Package,
      href: "/products",
      active: pathname === "/products",
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/analytics",
      active: pathname === "/analytics",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      // Toast is handled in the auth provider
    } catch (error) {
      console.error("Failed to logout:", error)
      toast.error("Failed to logout. Please try again.")
    }
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold">Ecommerce Dashboard</h1>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
              onClick={() => isMobile && setMobileMenuOpen(false)}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Theme</span>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Notifications</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>New order received</DropdownMenuItem>
              <DropdownMenuItem>Product out of stock</DropdownMenuItem>
              <DropdownMenuItem>New review submitted</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg border">
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">Account</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )

  // For desktop view
  if (!isMobile) {
    return (
      <div className="hidden md:flex flex-col h-full w-64 bg-background border-r">
        <SidebarContent />
      </div>
    )
  }

  // For mobile view
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background border-b md:hidden">
        <h1 className="text-xl font-bold">Ecommerce</h1>
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 sm:max-w-[280px] h-screen block" side="left">
            <div className="flex flex-col h-full bg-background">
              <SidebarContent />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-16 md:hidden"></div> {/* Spacer for mobile header */}
    </>
  )
}

