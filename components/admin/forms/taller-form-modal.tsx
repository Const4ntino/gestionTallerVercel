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
import { talleresApi } from "@/lib/admin-api"
import type { TallerResponse, TallerRequest } from "@/types/admin"
import { toast } from "sonner"

interface TallerFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taller?: TallerResponse | null
  onSuccess: () => void
}

export function TallerFormModal({ open, onOpenChange, taller, onSuccess }: TallerFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    ciudad: "",
    direccion: "",
    logoUrl: "",
    estado: "ACTIVO",
  })

  useEffect(() => {
    if (open) {
      if (taller) {
        setFormData({
          nombre: taller.nombre,
          ciudad: taller.ciudad,
          direccion: taller.direccion,
          logoUrl: taller.logoUrl || "",
          estado: taller.estado,
        })
      } else {
        setFormData({
          nombre: "",
          ciudad: "",
          direccion: "",
          logoUrl: "",
          estado: "ACTIVO",
        })
      }
    }
  }, [open, taller])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data: TallerRequest = {
        nombre: formData.nombre,
        ciudad: formData.ciudad,
        direccion: formData.direccion,
        logoUrl: formData.logoUrl || null,
        estado: formData.estado,
      }

      if (taller) {
        await talleresApi.update(taller.id, data)
        toast.success("Taller actualizado correctamente")
      } else {
        await talleresApi.create(data)
        toast.success("Taller creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(taller ? "Error al actualizar taller" : "Error al crear taller")
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
          <DialogTitle>{taller ? "Editar Taller" : "Crear Nuevo Taller"}</DialogTitle>
          <DialogDescription>
            {taller ? "Modifica los datos del taller." : "Completa los datos para crear un nuevo taller."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Taller</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Nombre del taller"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => handleChange("ciudad", e.target.value)}
                placeholder="Ciudad"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
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
              placeholder="Dirección completa del taller"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL del Logo (opcional)</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => handleChange("logoUrl", e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
              type="url"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {taller ? "Actualizando..." : "Creando..."}
                </>
              ) : taller ? (
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
