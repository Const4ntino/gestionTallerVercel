"use client"

import type React from "react"
import { ClienteSidebar } from "./cliente-sidebar"

interface ClienteLayoutProps {
  children: React.ReactNode
}

export function ClienteLayout({ children }: ClienteLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <ClienteSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <ClienteSidebar />
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">Panel de Cliente</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
