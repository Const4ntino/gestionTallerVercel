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
import { Loader2, Plus, Trash2 } from "lucide-react"
import {
  mantenimientosApi,
  vehiculosApi,
  serviciosMantenimientoApi,
  trabajadoresMantenimientoApi,
  productosMantenimientoApi,
} from "@/lib/mantenimientos-api"
import type {
  MantenimientoResponse,
  MantenimientoRequest,
  VehiculoResponse,
  ServicioResponse,
  TrabajadorResponse,
  ProductoResponse,
  MantenimientoEstado,
  MantenimientoProductoRequest,
} from "@/types/mantenimientos"
import { toast } from "sonner"

interface MantenimientoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantenimiento?: MantenimientoResponse | null
  onSuccess: () => void
}

export function MantenimientoFormModal({ open, onOpenChange, mantenimiento, onSuccess }: MantenimientoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [servicios, setServicios] = useState<ServicioResponse[]>([])
  const [trabajadores, setTrabajadores] = useState<TrabajadorResponse[]>([])
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [selectedTallerId, setSelectedTallerId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    vehiculoId: "",
    servicioId: "",
    trabajadorId: "",
    estado: "SOLICITADO" as MantenimientoEstado,
    observacionesCliente: "",
    observacionesTrabajador: "",
  })

  const [productosUsados, setProductosUsados] = useState<MantenimientoProductoRequest[]>([])

  useEffect(() => {
    if (open) {
      loadData()
      if (mantenimiento) {
        setFormData({
          vehiculoId: mantenimiento.vehiculo.id.toString(),
          servicioId: mantenimiento.servicio.id.toString(),
          trabajadorId: mantenimiento.trabajador?.id?.toString() || "",
          estado: mantenimiento.estado,
          observacionesCliente: mantenimiento.observacionesCliente || "",
          observacionesTrabajador: mantenimiento.observacionesTrabajador || "",
        })
        setProductosUsados(
          mantenimiento.productosUsados.map((p) => ({
            productoId: p.producto.id,
            cantidadUsada: p.cantidadUsada,
            precioEnUso: p.precioEnUso,
          })),
        )
        setSelectedTallerId(mantenimiento.servicio.taller.id)
      } else {
        setFormData({
          vehiculoId: "",
          servicioId: "",
          trabajadorId: "",
          estado: "SOLICITADO",
          observacionesCliente: "",
          observacionesTrabajador: "",
        })
        setProductosUsados([])
        setSelectedTallerId(null)
      }
    }
  }, [open, mantenimiento])

  const loadData = async () => {
    try {
      const [vehiculosResponse, serviciosResponse, trabajadoresResponse] = await Promise.all([
        vehiculosApi.getAll(),
        serviciosMantenimientoApi.getAll(),
        trabajadoresMantenimientoApi.getAll(),
      ])

      setVehiculos(vehiculosResponse)
      setServicios(serviciosResponse)
      setTrabajadores(trabajadoresResponse)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos del formulario")
    }
  }

  const loadProductosPorTaller = async (tallerId: number) => {
    try {
      const productosResponse = await productosMantenimientoApi.filterByTaller(tallerId)
      setProductos(productosResponse)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast.error("Error al cargar productos del taller")
    }
  }

  const handleServicioChange = (servicioId: string) => {
    setFormData((prev) => ({ ...prev, servicioId }))

    const servicio = servicios.find((s) => s.id.toString() === servicioId)
    if (servicio) {
      setSelectedTallerId(servicio.taller.id)
      loadProductosPorTaller(servicio.taller.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data: MantenimientoRequest = {
        vehiculoId: Number.parseInt(formData.vehiculoId),
        servicioId: Number.parseInt(formData.servicioId),
        trabajadorId: formData.trabajadorId ? Number.parseInt(formData.trabajadorId) : null,
        estado: formData.estado,
        observacionesCliente: formData.observacionesCliente || null,
        observacionesTrabajador: formData.observacionesTrabajador || null,
        productosUsados: productosUsados.length > 0 ? productosUsados : undefined,
      }

      if (mantenimiento) {
        await mantenimientosApi.update(mantenimiento.id, data)
        toast.success("Mantenimiento actualizado correctamente")
      } else {
        await mantenimientosApi.create(data)
        toast.success("Mantenimiento creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(mantenimiento ? "Error al actualizar mantenimiento" : "Error al crear mantenimiento")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const agregarProducto = () => {
    setProductosUsados((prev) => [...prev, { productoId: 0, cantidadUsada: 1, precioEnUso: 0 }])
  }

  const eliminarProducto = (index: number) => {
    setProductosUsados((prev) => prev.filter((_, i) => i !== index))
  }

  const actualizarProducto = (index: number, field: keyof MantenimientoProductoRequest, value: number) => {
    setProductosUsados((prev) => prev.map((producto, i) => (i === index ? { ...producto, [field]: value } : producto)))
  }

  const estadosPermitidos = mantenimiento
    ? ["SOLICITADO", "PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO"]
    : ["SOLICITADO", "PENDIENTE", "EN_PROCESO"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mantenimiento ? "Editar Mantenimiento" : "Crear Nuevo Mantenimiento"}</DialogTitle>
          <DialogDescription>
            {mantenimiento
              ? "Modifica los datos del mantenimiento."
              : "Completa los datos para crear un nuevo mantenimiento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehiculoId">Vehículo</Label>
              <Select value={formData.vehiculoId} onValueChange={(value) => handleChange("vehiculoId", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehiculos.map((vehiculo) => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                      {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} ({vehiculo.cliente.usuario.nombreCompleto})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicioId">Servicio</Label>
              <Select value={formData.servicioId} onValueChange={handleServicioChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((servicio) => (
                    <SelectItem key={servicio.id} value={servicio.id.toString()}>
                      {servicio.nombre} - {servicio.taller.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trabajadorId">Trabajador (Opcional)</Label>
              <Select value={formData.trabajadorId} onValueChange={(value) => handleChange("trabajadorId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un trabajador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin asignar</SelectItem>
                  {trabajadores.map((trabajador) => (
                    <SelectItem key={trabajador.id} value={trabajador.id.toString()}>
                      {trabajador.usuario.nombreCompleto} - {trabajador.especialidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosPermitidos.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacionesCliente">Observaciones del Cliente</Label>
            <Textarea
              id="observacionesCliente"
              value={formData.observacionesCliente}
              onChange={(e) => handleChange("observacionesCliente", e.target.value)}
              placeholder="Observaciones o comentarios del cliente"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacionesTrabajador">Observaciones del Trabajador</Label>
            <Textarea
              id="observacionesTrabajador"
              value={formData.observacionesTrabajador}
              onChange={(e) => handleChange("observacionesTrabajador", e.target.value)}
              placeholder="Observaciones técnicas del trabajador"
              rows={2}
            />
          </div>

          {/* Productos Usados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Productos Usados</Label>
              <Button type="button" variant="outline" size="sm" onClick={agregarProducto} disabled={!selectedTallerId}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </div>

            {productosUsados.map((producto, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 items-end p-3 border rounded">
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <Select
                    value={producto.productoId.toString()}
                    onValueChange={(value) => {
                      const selectedProduct = productos.find((p) => p.id.toString() === value)
                      actualizarProducto(index, "productoId", Number.parseInt(value))
                      if (selectedProduct) {
                        actualizarProducto(index, "precioEnUso", selectedProduct.precio)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id.toString()}>
                          {prod.nombre} - ${prod.precio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={producto.cantidadUsada}
                    onChange={(e) => actualizarProducto(index, "cantidadUsada", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Precio Unitario</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={producto.precioEnUso}
                    onChange={(e) => actualizarProducto(index, "precioEnUso", Number.parseFloat(e.target.value))}
                  />
                </div>

                <Button type="button" variant="outline" size="sm" onClick={() => eliminarProducto(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {selectedTallerId && productos.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay productos disponibles para este taller.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mantenimiento ? "Actualizando..." : "Creando..."}
                </>
              ) : mantenimiento ? (
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
