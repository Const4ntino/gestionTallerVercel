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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { serviciosApi } from "@/lib/servicios-api"
import { talleresApi } from "@/lib/admin-api"
import type { ServicioResponse, ServicioRequest, TallerResponse } from "@/types/servicios"
import { toast } from "sonner"

interface ServicioFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  servicio?: ServicioResponse | null
  onSuccess: () => void
}

export function ServicioFormModal({ open, onOpenChange, servicio, onSuccess }: ServicioFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [formData, setFormData] = useState({
    tallerId: "",
    nombre: "",
    descripcion: "",
    precioBase: "",
    duracionEstimadaHoras: "",
    estado: "ACTIVO", // Valor predeterminado para nuevos servicios
  })

  useEffect(() => {
    if (open) {
      loadTalleres()
      if (servicio) {
        setFormData({
          tallerId: servicio.taller?.id?.toString() || "",
          nombre: servicio.nombre || "",
          descripcion: servicio.descripcion || "",
          precioBase: servicio.precioBase?.toString() || "",
          duracionEstimadaHoras: servicio.duracionEstimadaHoras?.toString() || "",
          estado: servicio.estado || "ACTIVO",
        })
      } else {
        setFormData({
          tallerId: "",
          nombre: "",
          descripcion: "",
          precioBase: "",
          duracionEstimadaHoras: "",
          estado: "ACTIVO", // Valor predeterminado para nuevos servicios
        })
      }
    }
  }, [open, servicio])

  const loadTalleres = async () => {
    try {
      const response = await talleresApi.getAll()
      setTalleres(response)
    } catch (error) {
      console.error("Error al cargar talleres:", error)
      toast.error("Error al cargar los talleres")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data: ServicioRequest = {
        tallerId: Number.parseInt(formData.tallerId),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precioBase: Number.parseFloat(formData.precioBase),
        duracionEstimadaHoras: Number.parseFloat(formData.duracionEstimadaHoras),
        estado: formData.estado,
      }

      if (servicio) {
        await serviciosApi.update(servicio.id, data)
        toast.success("Servicio actualizado correctamente")
      } else {
        await serviciosApi.create(data)
        toast.success("Servicio creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(servicio ? "Error al actualizar servicio" : "Error al crear servicio")
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{servicio ? "Editar Servicio" : "Crear Nuevo Servicio"}</DialogTitle>
          <DialogDescription>
            {servicio ? "Modifica los datos del servicio." : "Completa los datos para crear un nuevo servicio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Servicio</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej: Cambio de Aceite, Revisión General"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              placeholder="Descripción detallada del servicio"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precioBase">Precio Base (S/)</Label>
              <Input
                id="precioBase"
                value={formData.precioBase}
                onChange={(e) => handleChange("precioBase", e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracionEstimadaHoras">Duración Estimada (horas)</Label>
              <Input
                id="duracionEstimadaHoras"
                value={formData.duracionEstimadaHoras}
                onChange={(e) => handleChange("duracionEstimadaHoras", e.target.value)}
                placeholder="0.0"
                type="number"
                step="0.5"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                <SelectItem value="SUSPENDIDO">SUSPENDIDO</SelectItem>
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
                  {servicio ? "Actualizando..." : "Creando..."}
                </>
              ) : servicio ? (
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
