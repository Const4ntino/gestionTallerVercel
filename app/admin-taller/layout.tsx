"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminTallerSidebar } from "@/components/admin-taller/admin-taller-sidebar"

export default function AdminTallerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.rol !== "ADMINISTRADOR_TALLER") {
        // Redirigir según el rol
        if (user.rol === "ADMINISTRADOR") {
          router.push("/admin")
        } else if (user.rol === "CLIENTE") {
          router.push("/cliente/vehiculos")
        } else {
          router.push("/login")
        }
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || user.rol !== "ADMINISTRADOR_TALLER") {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminTallerSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
