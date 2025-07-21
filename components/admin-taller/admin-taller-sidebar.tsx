"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  LayoutDashboard, 
  Wrench, 
  LogOut, 
  Users, 
  UserCheck, 
  Car, 
  FileText, 
  Package 
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin-taller",
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",
    href: "/admin-taller/usuarios",
    icon: Users,
  },
  {
    title: "Clientes",
    href: "/admin-taller/clientes",
    icon: UserCheck,
  },
  {
    title: "Vehículos",
    href: "/admin-taller/vehiculos",
    icon: Car,
  },
  {
    title: "Mantenimientos",
    href: "/admin-taller/mantenimientos",
    icon: Wrench,
  },
  {
    title: "Facturas",
    href: "/admin-taller/facturas",
    icon: FileText,
  },
  {
    title: "Productos",
    href: "/admin-taller/productos",
    icon: Package,
  },
]

export function AdminTallerSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Panel Taller</h2>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-secondary")}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
