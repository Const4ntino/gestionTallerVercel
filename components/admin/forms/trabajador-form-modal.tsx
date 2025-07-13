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
import { trabajadoresApi, usuariosApi, talleresApi } from "@/lib/admin-api"
import type { TrabajadorResponse, TrabajadorRequest, UsuarioResponse, TallerResponse } from "@/types/admin"
import { toast } from "sonner"

interface TrabajadorFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trabajador?: TrabajadorResponse | null
  onSuccess: () => void
}

export function TrabajadorFormModal({ open, onOpenChange, trabajador, onSuccess }: TrabajadorFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [formData, setFormData] = useState({
    usuarioId: "",
    especialidad: "",
    tallerId: "",
  })

  useEffect(() => {
    if (open) {
      loadData()
      if (trabajador) {
        setFormData({
          usuarioId: trabajador.usuario.id.toString(),
          especialidad: trabajador.especialidad,
          tallerId: trabajador.taller.id.toString(),
        })
      } else {
        setFormData({
          usuarioId: "",
          especialidad: "",
          tallerId: "",
        })
      }
    }
  }, [open, trabajador])

  const loadData = async () => {
    try {
      const [usuariosResponse, talleresResponse] = await Promise.all([
        usuariosApi.filter({ rol: "TRABAJADOR", size: 100 }),
        talleresApi.getAll(),
      ])

      // Filtrar usuarios que no tienen trabajador asignado
      const usuariosSinTrabajador = usuariosResponse.content.filter(
        (usuario) => !trabajador || usuario.id === trabajador.usuario.id,
      )

      setUsuarios(usuariosSinTrabajador)
      setTalleres(talleresResponse)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data: TrabajadorRequest = {
        usuarioId: Number.parseInt(formData.usuarioId),
        especialidad: formData.especialidad,
        tallerId: Number.parseInt(formData.tallerId),
      }

      if (trabajador) {
        await trabajadoresApi.update(trabajador.id, data)
        toast.success("Trabajador actualizado correctamente")
      } else {
        await trabajadoresApi.create(data)
        toast.success("Trabajador creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(trabajador ? "Error al actualizar trabajador" : "Error al crear trabajador")
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{trabajador ? "Editar Trabajador" : "Crear Nuevo Trabajador"}</DialogTitle>
          <DialogDescription>
            {trabajador ? "Modifica los datos del trabajador." : "Completa los datos para crear un nuevo trabajador."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usuarioId">Usuario</Label>
            <Select value={formData.usuarioId} onValueChange={(value) => handleChange("usuarioId", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id.toString()}>
                    {usuario.nombreCompleto} ({usuario.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="especialidad">Especialidad</Label>
            <Input
              id="especialidad"
              value={formData.especialidad}
              onChange={(e) => handleChange("especialidad", e.target.value)}
              placeholder="Ej: Mecánico General, Electricista Automotriz"
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
                    {taller.nombre} - {taller.ciudad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {trabajador ? "Actualizando..." : "Creando..."}
                </>
              ) : trabajador ? (
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
