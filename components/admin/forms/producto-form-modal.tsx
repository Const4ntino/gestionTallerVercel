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
import { productosApi, categoriasProductoApi } from "@/lib/productos-api"
import { talleresApi } from "@/lib/admin-api"
import type { ProductoResponse, ProductoRequest, CategoriaProductoResponse, TallerResponse } from "@/types/productos"
import { toast } from "sonner"

interface ProductoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto?: ProductoResponse | null
  onSuccess: () => void
}

export function ProductoFormModal({ open, onOpenChange, producto, onSuccess }: ProductoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categorias, setCategorias] = useState<CategoriaProductoResponse[]>([])
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [formData, setFormData] = useState({
    tallerId: "",
    nombre: "",
    descripcion: "",
    categoriaId: "",
    imageUrl: "",
    precio: "",
    stock: "",
  })

  useEffect(() => {
    if (open) {
      loadData()
      if (producto) {
        setFormData({
          tallerId: producto.taller?.id?.toString() || "",
          nombre: producto.nombre || "",
          descripcion: producto.descripcion || "",
          categoriaId: producto.categoria?.id?.toString() || "",
          imageUrl: producto.imageUrl || "",
          precio: producto.precio?.toString() || "",
          stock: producto.stock?.toString() || "",
        })
      } else {
        setFormData({
          tallerId: "",
          nombre: "",
          descripcion: "",
          categoriaId: "",
          imageUrl: "",
          precio: "",
          stock: "",
        })
      }
    }
  }, [open, producto])

  const loadData = async () => {
    try {
      const [categoriasResponse, talleresResponse] = await Promise.all([
        categoriasProductoApi.getAll(),
        talleresApi.getAll(),
      ])

      setCategorias(categoriasResponse)
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
      const data: ProductoRequest = {
        tallerId: Number.parseInt(formData.tallerId),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoriaId: Number.parseInt(formData.categoriaId),
        imageUrl: formData.imageUrl || null,
        precio: Number.parseFloat(formData.precio),
        stock: Number.parseInt(formData.stock),
      }

      if (producto) {
        await productosApi.update(producto.id, data)
        toast.success("Producto actualizado correctamente")
      } else {
        await productosApi.create(data)
        toast.success("Producto creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(producto ? "Error al actualizar producto" : "Error al crear producto")
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
          <DialogTitle>{producto ? "Editar Producto" : "Crear Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {producto ? "Modifica los datos del producto." : "Completa los datos para crear un nuevo producto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Producto</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej: Aceite Sintético 5W-30"
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
              placeholder="Descripción detallada del producto"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoriaId">Categoría</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) => handleChange("categoriaId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de Imagen (opcional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                type="url"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                value={formData.precio}
                onChange={(e) => handleChange("precio", e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="0"
                type="number"
                min="0"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {producto ? "Actualizando..." : "Creando..."}
                </>
              ) : producto ? (
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
