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
import { clientesApi, usuariosApi, talleresApi } from "@/lib/admin-api"
import type { ClienteResponse, ClienteRequest, UsuarioResponse, TallerResponse } from "@/types/admin"
import { toast } from "sonner"

interface ClienteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: ClienteResponse | null
  onSuccess: () => void
}

export function ClienteFormModal({ open, onOpenChange, cliente, onSuccess }: ClienteFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [formData, setFormData] = useState({
    usuarioId: "",
    telefono: "",
    direccion: "",
    tallerAsignadoId: "",
  })

  useEffect(() => {
    if (open) {
      loadData()
      if (cliente) {
        setFormData({
          usuarioId: cliente.usuario.id.toString(),
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          tallerAsignadoId: cliente.tallerAsignado.id.toString(),
        })
      } else {
        setFormData({
          usuarioId: "",
          telefono: "",
          direccion: "",
          tallerAsignadoId: "",
        })
      }
    }
  }, [open, cliente])

  const loadData = async () => {
    try {
      const [usuariosResponse, talleresResponse] = await Promise.all([
        usuariosApi.filter({ rol: "CLIENTE", size: 100 }),
        talleresApi.getAll(),
      ])

      // Filtrar usuarios que no tienen cliente asignado o es el cliente actual
      let usuariosSinCliente = usuariosResponse.content

      // Si estamos editando, incluir el usuario actual
      if (cliente) {
        usuariosSinCliente = usuariosResponse.content.filter((usuario) => usuario.id === cliente.usuario.id)
      }

      setUsuarios(usuariosSinCliente)
      setTalleres(talleresResponse)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos del formulario")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data: ClienteRequest = {
        usuarioId: Number.parseInt(formData.usuarioId),
        telefono: formData.telefono,
        direccion: formData.direccion,
        tallerAsignadoId: Number.parseInt(formData.tallerAsignadoId),
      }

      if (cliente) {
        await clientesApi.update(cliente.id, data)
        toast.success("Cliente actualizado correctamente")
      } else {
        await clientesApi.create(data)
        toast.success("Cliente creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(cliente ? "Error al actualizar cliente" : "Error al crear cliente")
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
          <DialogTitle>{cliente ? "Editar Cliente" : "Crear Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {cliente ? "Modifica los datos del cliente." : "Completa los datos para crear un nuevo cliente."}
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
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              placeholder="Número de teléfono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              placeholder="Dirección completa"
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
                  {cliente ? "Actualizando..." : "Creando..."}
                </>
              ) : cliente ? (
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
