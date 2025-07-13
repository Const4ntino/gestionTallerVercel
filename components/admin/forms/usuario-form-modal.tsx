"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { usuariosApi, talleresApi } from "@/lib/admin-api"
import type {
  UsuarioResponse,
  UsuarioRequest,
  UsuarioClienteRequest,
  UsuarioTrabajadorRequest,
  TallerResponse,
} from "@/types/admin"
import { toast } from "sonner"

interface UsuarioFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: UsuarioResponse | null
  onSuccess: () => void
}

export function UsuarioFormModal({ open, onOpenChange, usuario, onSuccess }: UsuarioFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    correo: "",
    username: "",
    contrasena: "",
    rol: "",
    telefono: "",
    direccion: "",
    tallerAsignadoId: "",
    especialidad: "",
    tallerId: "",
  })

  useEffect(() => {
    if (open) {
      loadTalleres()
      if (usuario) {
        setFormData({
          nombreCompleto: usuario.nombreCompleto,
          correo: usuario.correo,
          username: usuario.username,
          contrasena: "",
          rol: usuario.rol,
          telefono: "",
          direccion: "",
          tallerAsignadoId: "",
          especialidad: "",
          tallerId: "",
        })
      } else {
        setFormData({
          nombreCompleto: "",
          correo: "",
          username: "",
          contrasena: "",
          rol: "",
          telefono: "",
          direccion: "",
          tallerAsignadoId: "",
          especialidad: "",
          tallerId: "",
        })
      }
    }
  }, [open, usuario])

  const loadTalleres = async () => {
    try {
      const response = await talleresApi.getAll()
      setTalleres(response)
    } catch (error) {
      console.error("Error al cargar talleres:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (usuario) {
        // Actualizar usuario existente
        const updateData: UsuarioRequest = {
          nombreCompleto: formData.nombreCompleto,
          correo: formData.correo,
          username: formData.username,
          contrasena: formData.contrasena || undefined,
          rol: formData.rol,
        }
        await usuariosApi.update(usuario.id, updateData)
        toast.success("Usuario actualizado correctamente")
      } else {
        // Crear nuevo usuario
        if (formData.rol === "CLIENTE") {
          const clienteData: UsuarioClienteRequest = {
            nombreCompleto: formData.nombreCompleto,
            correo: formData.correo,
            username: formData.username,
            contrasena: formData.contrasena,
            telefono: formData.telefono,
            direccion: formData.direccion,
            tallerAsignadoId: Number.parseInt(formData.tallerAsignadoId),
          }
          await usuariosApi.createCliente(clienteData)
        } else if (formData.rol === "TRABAJADOR") {
          const trabajadorData: UsuarioTrabajadorRequest = {
            nombreCompleto: formData.nombreCompleto,
            correo: formData.correo,
            username: formData.username,
            contrasena: formData.contrasena,
            especialidad: formData.especialidad,
            tallerId: Number.parseInt(formData.tallerId),
          }
          await usuariosApi.createTrabajador(trabajadorData)
        } else {
          const userData: UsuarioRequest = {
            nombreCompleto: formData.nombreCompleto,
            correo: formData.correo,
            username: formData.username,
            contrasena: formData.contrasena,
            rol: formData.rol,
          }
          await usuariosApi.create(userData)
        }
        toast.success("Usuario creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(usuario ? "Error al actualizar usuario" : "Error al crear usuario")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {usuario ? "Modifica los datos del usuario." : "Completa los datos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombreCompleto">Nombre Completo</Label>
              <Input
                id="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={(e) => handleChange("nombreCompleto", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña {usuario && "(dejar vacío para mantener)"}</Label>
              <Input
                id="contrasena"
                type="password"
                value={formData.contrasena}
                onChange={(e) => handleChange("contrasena", e.target.value)}
                required={!usuario}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select value={formData.rol} onValueChange={(value) => handleChange("rol", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="ADMINISTRADOR_TALLER">Administrador de Taller</SelectItem>
                <SelectItem value="TRABAJADOR">Trabajador</SelectItem>
                <SelectItem value="CLIENTE">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos adicionales para CLIENTE */}
          {formData.rol === "CLIENTE" && !usuario && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tallerAsignadoId">Taller Asignado</Label>
                  <Select
                    value={formData.tallerAsignadoId}
                    onValueChange={(value) => handleChange("tallerAsignadoId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un taller" />
                    </SelectTrigger>
                    <SelectContent>
                      {talleres.map((taller) => (
                        <SelectItem key={taller.id} value={taller.id.toString()}>
                          {taller.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Campos adicionales para TRABAJADOR */}
          {formData.rol === "TRABAJADOR" && !usuario && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Input
                    id="especialidad"
                    value={formData.especialidad}
                    onChange={(e) => handleChange("especialidad", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tallerId">Taller</Label>
                  <Select value={formData.tallerId} onValueChange={(value) => handleChange("tallerId", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un taller" />
                    </SelectTrigger>
                    <SelectContent>
                      {talleres.map((taller) => (
                        <SelectItem key={taller.id} value={taller.id.toString()}>
                          {taller.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {usuario ? "Actualizando..." : "Creando..."}
                </>
              ) : usuario ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
