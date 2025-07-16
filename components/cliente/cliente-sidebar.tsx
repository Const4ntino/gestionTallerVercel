"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { Car, FileText, Receipt, User, LogOut, Menu } from "lucide-react"

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

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/cliente/vehiculos" className="flex items-center gap-2 font-semibold">
          <Car className="h-6 w-6" />
          <span>Panel Cliente</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4 lg:p-6">
          <nav className="grid gap-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </ScrollArea>
      <div className="mt-auto p-4">
        <div className="flex flex-col gap-2">
          <div className="text-sm">
            <p className="font-medium">{user?.nombreCompleto}</p>
            <p className="text-muted-foreground">CLIENTE</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="justify-start bg-transparent">
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
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
