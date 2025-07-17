"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Eye, EyeOff, User, Phone, MapPin, Building, Calendar, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { clientePerfilApi } from "@/lib/cliente-perfil-api"
import type { ClienteResponse, UsuarioClienteRequest } from "@/types/cliente-perfil"

const formSchema = z.object({
  nombreCompleto: z
    .string()
    .min(1, "El nombre completo es requerido")
    .max(150, "El nombre no puede exceder 150 caracteres"),
  correo: z.string().email("Debe ser un correo válido").max(100, "El correo no puede exceder 100 caracteres"),
  username: z.string().min(1, "El username es requerido").max(50, "El username no puede exceder 50 caracteres"),
  contrasena: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
  telefono: z.string()
    .min(9, "El teléfono debe tener 9 dígitos")
    .max(9, "El teléfono debe tener 9 dígitos")
    .regex(/^9[0-9]{8}$/, "Debe comenzar con 9 y contener solo números"),
  direccion: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function MisDatosPage() {
  const [cliente, setCliente] = useState<ClienteResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: "",
      correo: "",
      username: "",
      contrasena: "",
      telefono: "",
      direccion: "",
    },
  })

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const data = await clientePerfilApi.obtenerMisDatos()
      setCliente(data)

      // Llenar el formulario con los datos obtenidos
      form.reset({
        nombreCompleto: data.usuario.nombreCompleto,
        correo: data.usuario.correo,
        username: data.usuario.username,
        contrasena: "",
        telefono: data.telefono,
        direccion: data.direccion || "",
      })
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos del perfil")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setUpdating(true)

      const requestData: UsuarioClienteRequest = {
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        username: data.username,
        telefono: data.telefono,
        direccion: data.direccion,
        tallerAsignadoId: cliente?.tallerAsignado?.id,
      }

      // Solo incluir contraseña si se proporcionó
      if (data.contrasena && data.contrasena.trim() !== "") {
        requestData.contrasena = data.contrasena
      }

      const updatedData = await clientePerfilApi.actualizarMisDatos(requestData)
      setCliente(updatedData)

      // Limpiar el campo de contraseña después de actualizar
      form.setValue("contrasena", "")

      toast.success("Datos actualizados correctamente")
    } catch (error) {
      console.error("Error al actualizar datos:", error)
      toast.error("Error al actualizar los datos")
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Datos</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y configuración de cuenta</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario de edición */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tu información personal y datos de contacto</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contrasena"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Deja vacío para no cambiar"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>Deja este campo vacío si no deseas cambiar tu contraseña</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
  placeholder="Ingresa tu teléfono"
  maxLength={9}
  inputMode="numeric"
  pattern="9[0-9]{8}"
  onKeyDown={e => {
    // Permite: borrar, tab, flechas, home/end
    if (["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"].includes(e.key)) return;
    // Permite solo números
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }}
  onInput={e => {
    // Solo números y máximo 9 caracteres
    const value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 9);
    field.onChange(value);
  }}
  {...field}
/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ingresa tu dirección (opcional)" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={updating} className="w-full">
                  {updating ? "Actualizando..." : "Guardar Cambios"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Información de solo lectura */}
        <div className="space-y-6">
          {/* Información de cuenta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Información de Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Rol</p>
                  <Badge variant="secondary">{cliente?.usuario.rol}</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha de Registro</p>
                  <p className="text-sm text-muted-foreground">
                    {cliente?.usuario.fechaCreacion
                      ? new Date(cliente.usuario.fechaCreacion).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No disponible"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Última Actualización</p>
                  <p className="text-sm text-muted-foreground">
                    {cliente?.usuario.fechaActualizacion
                      ? new Date(cliente.usuario.fechaActualizacion).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No disponible"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del taller */}
          {cliente?.tallerAsignado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Taller Asignado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nombre</p>
                    <p className="text-sm text-muted-foreground">{cliente.tallerAsignado.nombre}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ciudad</p>
                    <p className="text-sm text-muted-foreground">{cliente.tallerAsignado.ciudad}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-sm text-muted-foreground">{cliente.tallerAsignado.direccion}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Teléfono</p>
                    <p className="text-sm text-muted-foreground">{cliente.tallerAsignado.telefono}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Estado</p>
                    <Badge variant={cliente.tallerAsignado.estado === "ACTIVO" ? "default" : "secondary"}>
                      {cliente.tallerAsignado.estado}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
