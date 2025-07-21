"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminTallerPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de usuarios que es la primera disponible para ADMINISTRADOR_TALLER
    router.push("/admin/usuarios")
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirigiendo...</h1>
        <p className="text-muted-foreground">Cargando panel de administración del taller</p>
      </div>
    </div>
  )
}
