"use client"

import type React from "react"
import { ClienteSidebar } from "./cliente-sidebar"

interface ClienteLayoutProps {
  children: React.ReactNode
}

export function ClienteLayout({ children }: ClienteLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="h-screen sticky top-0">
        <ClienteSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Añadimos un padding-top en móvil para evitar superposición con el botón de menú */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-14 md:pt-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
