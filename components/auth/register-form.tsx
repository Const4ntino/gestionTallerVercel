"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Lock, Phone, MapPin } from "lucide-react"
import { registerUser, saveAuthData } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import type { RegisterRequest } from "@/types/auth"

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterRequest>({
    nombreCompleto: "",
    dni: "",
    correo: "",
    username: "",
    contrasena: "",
    telefono: "",
    direccion: "",
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
      const response = await registerUser(formData)
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
    const { name, value } = e.target
    
    // Validación especial para el campo DNI: solo números y máximo 8 caracteres
    if (name === "dni" && value !== "") {
      const onlyNumbers = value.replace(/[^0-9]/g, "")
      if (onlyNumbers !== value) {
        // Si se intentó ingresar algo que no son números, usar solo los números
        setFormData((prev) => ({
          ...prev,
          [name]: onlyNumbers.slice(0, 8),
        }))
        return
      }
      // Limitar a 8 caracteres
      setFormData((prev) => ({
        ...prev,
        [name]: value.slice(0, 8),
      }))
      return
    }
    
    // Para los demás campos, comportamiento normal
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
        <CardDescription className="text-center">Completa el formulario para registrarte en el sistema</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombreCompleto">Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="nombreCompleto"
                name="nombreCompleto"
                type="text"
                placeholder="Ingresa tu nombre completo"
                value={formData.nombreCompleto}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dni"
                name="dni"
                type="text"
                placeholder="Ingresa tu DNI (8 dígitos)"
                value={formData.dni}
                onChange={handleChange}
                className="pl-10"
                maxLength={8}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="correo"
                name="correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.correo}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Elige un nombre de usuario"
                value={formData.username}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="contrasena"
                name="contrasena"
                type="password"
                placeholder="Crea una contraseña segura"
                value={formData.contrasena}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="Número de teléfono"
                value={formData.telefono}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="direccion"
                name="direccion"
                type="text"
                placeholder="Tu dirección"
                value={formData.direccion}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => router.push("/login")}
              type="button"
            >
              Inicia sesión aquí
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
