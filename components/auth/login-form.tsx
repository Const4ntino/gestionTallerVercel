"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Lock } from "lucide-react"
import { loginUser, saveAuthData } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import type { LoginRequest } from "@/types/auth"

export function LoginForm() {
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await loginUser(formData)
      saveAuthData(response)
      login(response.token, response.username, response.rol as any)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-xl border-blue-200">
      <CardHeader className="space-y-1 bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center text-blue-100">Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-blue-800 font-medium">Usuario</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={formData.username}
                onChange={handleChange}
                className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-800 font-medium">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-6">
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          <p className="text-sm text-center text-blue-800">
            ¿No tienes cuenta?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800"
              onClick={() => router.push("/register")}
              type="button"
            >
              Regístrate aquí
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
