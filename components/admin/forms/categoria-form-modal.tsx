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
import { Loader2 } from "lucide-react"
import { categoriasProductoApi } from "@/lib/productos-api"
import type { CategoriaProductoResponse, CategoriaProductoRequest } from "@/types/productos"
import { toast } from "sonner"

interface CategoriaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: CategoriaProductoResponse | null
  onSuccess: () => void
}

export function CategoriaFormModal({ open, onOpenChange, categoria, onSuccess }: CategoriaFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

  useEffect(() => {
    if (open) {
      if (categoria) {
        setFormData({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
        })
      } else {
        setFormData({
          nombre: "",
          descripcion: "",
        })
      }
    }
  }, [open, categoria])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data: CategoriaProductoRequest = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      }

      if (categoria) {
        await categoriasProductoApi.update(categoria.id, data)
        toast.success("Categoría actualizada correctamente")
      } else {
        await categoriasProductoApi.create(data)
        toast.success("Categoría creada correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(categoria ? "Error al actualizar categoría" : "Error al crear categoría")
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
          <DialogTitle>{categoria ? "Editar Categoría" : "Crear Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {categoria ? "Modifica los datos de la categoría." : "Completa los datos para crear una nueva categoría."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Categoría</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Ej: Lubricantes, Filtros, Repuestos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              placeholder="Descripción detallada de la categoría"
              rows={3}
              required
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
                  {categoria ? "Actualizando..." : "Creando..."}
                </>
              ) : categoria ? (
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
