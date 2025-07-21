"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Car,
  Wrench,
  FileText,
  Package,
  Settings,
  Building,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const allMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["ADMINISTRADOR"], // Solo visible para ADMINISTRADOR
  },
  {
    title: "Mi Empresa",
    href: "/admin/empresa",
    icon: Building,
    roles: ["ADMINISTRADOR"], // Solo visible para ADMINISTRADOR
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
    roles: ["ADMINISTRADOR", "ADMINISTRADOR_TALLER"], // Visible para ambos
  },
  {
    title: "Clientes",
    href: "/admin/clientes",
    icon: UserCheck,
    roles: ["ADMINISTRADOR", "ADMINISTRADOR_TALLER"], // Visible para ambos
  },
  {
    title: "Trabajadores",
    href: "/admin/trabajadores",
    icon: UserCheck,
    roles: ["ADMINISTRADOR"], // Solo visible para ADMINISTRADOR
  },
  {
    title: "Talleres",
    href: "/admin/talleres",
    icon: Building2,
    roles: ["ADMINISTRADOR"], // Solo visible para ADMINISTRADOR
  },
  {
    title: "Vehículos",
    href: "/admin/vehiculos",
    icon: Car,
    roles: ["ADMINISTRADOR", "ADMINISTRADOR_TALLER"], // Visible para ambos
  },
  {
    title: "Mantenimientos",
    href: "/admin/mantenimientos",
    icon: Wrench,
    roles: ["ADMINISTRADOR", "ADMINISTRADOR_TALLER"], // Visible para ambos
  },
  {
    title: "Facturas",
    href: "/admin/facturas",
    icon: FileText,
    roles: ["ADMINISTRADOR", "ADMINISTRADOR_TALLER"], // Visible para ambos
  },
  {
    title: "Productos",
    href: "/admin/productos",
    icon: Package,
    roles: ["ADMINISTRADOR", "ADMINISTRADOR_TALLER"], // Visible para ambos
  },
  {
    title: "Servicios",
    href: "/admin/servicios",
    icon: Settings,
    roles: ["ADMINISTRADOR"], // Solo visible para ADMINISTRADOR
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Filtrar los elementos del menú según el rol del usuario
  const menuItems = allMenuItems.filter((item) => item.roles.includes(user?.rol || ""))

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">
          {user?.rol === "ADMINISTRADOR_TALLER" ? "Panel Taller" : "Panel Admin"}
        </h2>
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
