"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const roleLabels = {
  ADMINISTRADOR: "Super Administrador",
  ADMINISTRADOR_TALLER: "Administrador de Taller",
  TRABAJADOR: "Trabajador",
  CLIENTE: "Cliente",
}

const roleColors = {
  ADMINISTRADOR: "bg-red-100 text-red-800 border-red-200",
  ADMINISTRADOR_TALLER: "bg-blue-100 text-blue-800 border-blue-200",
  TRABAJADOR: "bg-green-100 text-green-800 border-green-200",
  CLIENTE: "bg-gray-100 text-gray-800 border-gray-200",
}

export function UserInfoCard() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl">¡Bienvenido!</CardTitle>
        <CardDescription>Has iniciado sesión correctamente en el sistema</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Usuario</p>
          <p className="font-semibold text-lg">{user.username}</p>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Rol</p>
          <Badge variant="outline" className={`${roleColors[user.rol]} font-medium`}>
            {roleLabels[user.rol]}
          </Badge>
        </div>

        <div className="pt-4 space-y-2">
          <Button variant="outline" className="w-full bg-transparent" disabled>
            <Settings className="mr-2 h-4 w-4" />
            Configuración (Próximamente)
          </Button>

          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
