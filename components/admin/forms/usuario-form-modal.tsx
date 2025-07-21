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
import { useAuth } from "@/contexts/auth-context"
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
  TrabajadorRequest,
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
    dni: "",
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

  // Cargar los datos completos del usuario cuando se edita
  const loadUsuarioCompleto = async (id: number) => {
    try {
      const usuarioCompleto = await usuariosApi.getById(id)
      console.log("Usuario completo cargado:", usuarioCompleto) // Para depuración
      setFormData({
        nombreCompleto: usuarioCompleto.nombreCompleto,
        dni: usuarioCompleto.dni || "",
        correo: usuarioCompleto.correo,
        username: usuarioCompleto.username,
        contrasena: "",
        rol: usuarioCompleto.rol,
        telefono: "",
        direccion: "",
        tallerAsignadoId: "",
        especialidad: "",
        tallerId: "",
      })
    } catch (error) {
      console.error("Error al cargar datos completos del usuario:", error)
      toast.error("Error al cargar datos del usuario")
    }
  }

  useEffect(() => {
    if (open) {
      loadTalleres()
      if (usuario) {
        // Cargar datos completos del usuario para asegurar que tenemos el DNI
        loadUsuarioCompleto(usuario.id)
      } else {
        setFormData({
          nombreCompleto: "",
          dni: "",
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
          dni: formData.dni || "",
          correo: formData.correo,
          username: formData.username,
          contrasena: formData.contrasena || "",
          rol: formData.rol,
        }
        await usuariosApi.update(usuario.id, updateData)
        toast.success("Usuario actualizado correctamente")
      } else {
        // Crear nuevo usuario
        if (formData.rol === "CLIENTE") {
          const clienteData: UsuarioClienteRequest = {
            nombreCompleto: formData.nombreCompleto,
            dni: formData.dni || "",
            correo: formData.correo,
            username: formData.username,
            contrasena: formData.contrasena,
            telefono: formData.telefono,
            direccion: formData.direccion,
            tallerAsignadoId: Number.parseInt(formData.tallerAsignadoId),
          }
          await usuariosApi.createCliente(clienteData)
        } else if (formData.rol === "TRABAJADOR" || formData.rol === "ADMINISTRADOR_TALLER") {
          // Primero creamos el usuario con el rol correcto
          const userData: UsuarioRequest = {
            nombreCompleto: formData.nombreCompleto,
            dni: formData.dni || "",
            correo: formData.correo,
            username: formData.username,
            contrasena: formData.contrasena,
            rol: formData.rol, // Aquí aseguramos que se envíe el rol correcto (TRABAJADOR o ADMINISTRADOR_TALLER)
          }
          
          // Creamos el usuario primero
          const nuevoUsuario = await usuariosApi.create(userData)
          
          // Luego lo asociamos como trabajador al taller
          const trabajadorData: TrabajadorRequest = {
            usuarioId: nuevoUsuario.id,
            especialidad: formData.especialidad,
            tallerId: Number.parseInt(formData.tallerId),
          }
          
          // Creamos el trabajador asociado al usuario
          await usuariosApi.asociarTrabajador(trabajadorData)
        } else {
          const userData: UsuarioRequest = {
            nombreCompleto: formData.nombreCompleto,
            dni: formData.dni || "",
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
    // Validación especial para el campo DNI: solo números y máximo 8 caracteres
    if (field === "dni" && value !== "") {
      const onlyNumbers = value.replace(/[^0-9]/g, "")
      if (onlyNumbers !== value) {
        // Si se intentó ingresar algo que no son números, usar solo los números
        setFormData((prev) => ({
          ...prev,
          [field]: onlyNumbers.slice(0, 8),
        }))
        return
      }
      // Limitar a 8 caracteres
      setFormData((prev) => ({
        ...prev,
        [field]: value.slice(0, 8),
      }))
      return
    }
    
    // Para los demás campos, comportamiento normal
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Importar el contexto de autenticación para obtener el rol del usuario actual
  const { user } = useAuth()
  const isAdminTaller = user?.rol === "ADMINISTRADOR_TALLER"
  
  // Si el usuario es ADMINISTRADOR_TALLER, forzar a que solo pueda crear clientes
  useEffect(() => {
    if (isAdminTaller && !usuario) {
      setFormData(prev => ({ ...prev, rol: "CLIENTE" }))
    }
  }, [isAdminTaller, usuario])

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
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => handleChange("dni", e.target.value)}
                maxLength={8}
                placeholder="Ingrese DNI (8 dígitos)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                {/* Solo mostrar CLIENTE si es ADMINISTRADOR_TALLER, o mostrar todos si es ADMINISTRADOR */}
                {!isAdminTaller && <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>}
                {!isAdminTaller && <SelectItem value="ADMINISTRADOR_TALLER">Administrador de Taller</SelectItem>}
                {!isAdminTaller && <SelectItem value="TRABAJADOR">Trabajador</SelectItem>}
                <SelectItem value="CLIENTE">Cliente</SelectItem>
              </SelectContent>
            </Select>
            {isAdminTaller && (
              <p className="text-xs text-muted-foreground mt-1">
                Como Administrador de Taller, solo puede crear usuarios con rol Cliente.
              </p>
            )}
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

          {/* Campos adicionales para ADMINISTRADOR_TALLER */}
          {formData.rol === "ADMINISTRADOR_TALLER" && !usuario && (
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
