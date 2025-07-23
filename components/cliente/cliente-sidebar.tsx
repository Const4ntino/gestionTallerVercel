"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { Car, FileText, Receipt, User, LogOut, Menu, Bell } from "lucide-react"

const navigation = [
  {
    name: "Mis Vehículos",
    href: "/cliente/vehiculos",
    icon: Car,
  },
  {
    name: "Mis Mantenimientos",
    href: "/cliente/mantenimientos",
    icon: FileText,
  },
  {
    name: "Mis Alertas",
    href: "/cliente/alertas",
    icon: Bell,
  },
  {
    name: "Mis Facturas",
    href: "/cliente/facturas",
    icon: Receipt,
  },
  {
    name: "Mi Perfil",
    href: "/cliente/perfil",
    icon: User,
  },
]

function SidebarContent() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Panel Cliente</h2>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isActive && "bg-secondary")}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <div className="mt-auto">
        <div className="border-t p-4">
          <div className="mb-3 text-sm">
            <p className="font-medium">{user?.username}</p>
            <p className="text-muted-foreground">CLIENTE</p>
          </div>
          <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ClienteSidebar() {
  return (
    <>
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden border-r bg-muted/40 md:block h-full w-64">
        <div className="flex h-full flex-col">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}
