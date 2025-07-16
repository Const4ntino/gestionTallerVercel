"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirigir según el rol del usuario
      switch (user.rol) {
        case "ADMINISTRADOR":
          router.push("/admin")
          break
        case "CLIENTE":
          router.push("/cliente/vehiculos")
          break
        case "TRABAJADOR":
          router.push("/trabajador")
          break
        default:
          // Si no tiene un rol reconocido, mantener en dashboard
          break
      }
    } else if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Bienvenido, {user.nombreCompleto}</h1>
        <p className="text-muted-foreground">Redirigiendo al panel correspondiente...</p>
      </div>
    </div>
  )
}
