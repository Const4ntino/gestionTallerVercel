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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import { mantenimientosApi } from "@/lib/mantenimientos-api"
import { productosMantenimientoApi } from "@/lib/mantenimientos-api"
import type { MantenimientoPendienteFacturar, CalculatedTotalResponse, FacturaRequest } from "@/types/facturas"
import type { ProductoResponse, MantenimientoProductoRequest } from "@/types/mantenimientos"
import { Car, User, Wrench, Package, Receipt, PlusCircle, Trash2 } from "lucide-react"

interface FacturaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantenimiento: MantenimientoPendienteFacturar
  calculatedTotal: CalculatedTotalResponse
  onSuccess: () => void
}

interface ProductoUsado {
  productoId: number
  cantidadUsada: number
  precioEnUso: number
  subtotal: number
}

export function FacturaFormModal({
  open,
  onOpenChange,
  mantenimiento,
  calculatedTotal,
  onSuccess,
}: FacturaFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [detalles, setDetalles] = useState("")
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [productosUsados, setProductosUsados] = useState<ProductoUsado[]>([])
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [actualizandoProductos, setActualizandoProductos] = useState(false)

  // Cargar datos completos del mantenimiento cuando se abre el modal
  useEffect(() => {
    if (open && mantenimiento) {
      // Cargar productos del taller
      loadProductosByTaller()
      
      // Cargar datos completos del mantenimiento para asegurar que tenemos todos los productos
      loadMantenimientoCompleto(mantenimiento.id)
    }
  }, [open, mantenimiento])
  
  // Función para cargar los datos completos del mantenimiento
  const loadMantenimientoCompleto = async (mantenimientoId: number) => {
    try {
      setLoading(true)
      // Obtener el mantenimiento completo con todos sus productos
      const mantenimientoCompleto = await mantenimientosApi.getById(mantenimientoId)
      
      // Inicializar productos usados desde el mantenimiento completo
      if (mantenimientoCompleto.productosUsados && mantenimientoCompleto.productosUsados.length > 0) {
        const productosFormateados = mantenimientoCompleto.productosUsados.map(p => ({
          productoId: p.producto.id,
          cantidadUsada: p.cantidadUsada,
          precioEnUso: p.precioEnUso,
          subtotal: p.precioEnUso * p.cantidadUsada
        }))
        setProductosUsados(productosFormateados)
      } else {
        setProductosUsados([])
      }
    } catch (error) {
      console.error("Error al cargar el mantenimiento completo:", error)
      toast.error("Error al cargar los detalles del mantenimiento")
      setProductosUsados([])
    } finally {
      setLoading(false)
    }
  }
  
  const loadProductosByTaller = async () => {
    if (!mantenimiento?.servicio?.taller?.id) return
    
    try {
      setLoadingProductos(true)
      const tallerId = mantenimiento.servicio.taller.id
      const productosData = await productosMantenimientoApi.filterByTaller(tallerId)
      setProductos(productosData)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast.error("Error al cargar los productos disponibles")
    } finally {
      setLoadingProductos(false)
    }
  }
  
  const agregarProducto = () => {
    const nuevoProducto: ProductoUsado = {
      productoId: 0,
      cantidadUsada: 1,
      precioEnUso: 0,
      subtotal: 0
    }
    setProductosUsados([...productosUsados, nuevoProducto])
  }
  
  const eliminarProducto = (index: number) => {
    const nuevosProductos = [...productosUsados]
    nuevosProductos.splice(index, 1)
    setProductosUsados(nuevosProductos)
  }
  
  const actualizarProducto = (index: number, campo: string, valor: any) => {
    const nuevosProductos = [...productosUsados]
    nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor }
    
    if (campo === "productoId") {
      const productoSeleccionado = productos.find(p => p.id === valor)
      if (productoSeleccionado?.precio) {
        nuevosProductos[index].precioEnUso = productoSeleccionado.precio
        nuevosProductos[index].subtotal = productoSeleccionado.precio * nuevosProductos[index].cantidadUsada
      } else {
        nuevosProductos[index].precioEnUso = 0
        nuevosProductos[index].subtotal = 0
      }
    } else if (campo === "cantidadUsada") {
      nuevosProductos[index].subtotal = nuevosProductos[index].precioEnUso * valor
    }
    
    setProductosUsados(nuevosProductos)
  }
  
  const guardarProductos = async () => {
    if (!mantenimiento?.id) return
    
    try {
      setActualizandoProductos(true)
      
      // Convertir a formato requerido por la API
      const productosRequest: MantenimientoProductoRequest[] = productosUsados
        .filter(p => p.productoId > 0) // Filtrar productos no seleccionados
        .map(p => ({
          productoId: p.productoId,
          cantidadUsada: p.cantidadUsada,
          precioEnUso: p.precioEnUso
        }))
      
      // Actualizar productos del mantenimiento
      await mantenimientosApi.updateProductos(mantenimiento.id, productosRequest)
      
      // Recalcular el total
      const nuevoTotal = await facturasApi.calcularTotal(mantenimiento.id)
      
      // Actualizar el estado local
      toast.success("Productos actualizados correctamente")
      
      // Recargar la página para reflejar los cambios
      window.location.reload()
    } catch (error) {
      console.error("Error al actualizar productos:", error)
      toast.error("Error al actualizar los productos")
    } finally {
      setActualizandoProductos(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const facturaRequest: FacturaRequest = {
        mantenimientoId: mantenimiento.id,
        clienteId: mantenimiento.vehiculo?.cliente?.id || 0,
        tallerId: mantenimiento.servicio?.taller?.id || 0,
        detalles: detalles.trim() || undefined,
      }

      await facturasApi.create(facturaRequest)
      onSuccess()
    } catch (error) {
      console.error("Error al crear factura:", error)
      toast.error("Error al crear la factura")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Crear Factura
          </DialogTitle>
          <DialogDescription>Crear factura para el mantenimiento completado</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Mantenimiento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Mantenimiento</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Vehículo:</span>
                  <span>
                    {mantenimiento.vehiculo?.marca || "N/A"} {mantenimiento.vehiculo?.modelo || "N/A"}
                  </span>
                  <Badge variant="outline">{mantenimiento.vehiculo?.placa || "Sin placa"}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cliente:</span>
                  <span>{mantenimiento.vehiculo?.cliente?.usuario?.nombreCompleto || "Cliente no disponible"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Servicio:</span>
                  <span>{mantenimiento.servicio?.nombre || "Servicio no disponible"}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-medium">Trabajador:</span>
                  <span className="ml-2">{mantenimiento.trabajador?.usuario?.nombreCompleto || "No asignado"}</span>
                  {mantenimiento.trabajador?.especialidad && (
                    <Badge className="ml-2" variant="secondary">
                      {mantenimiento.trabajador.especialidad}
                    </Badge>
                  )}
                </div>

                <div>
                  <span className="font-medium">Taller:</span>
                  <span className="ml-2">{mantenimiento.servicio?.taller?.nombre || "Taller no disponible"}</span>
                </div>

                <div>
                  <span className="font-medium">Finalizado:</span>
                  <span className="ml-2">
                    {mantenimiento.fechaFin ? formatDate(mantenimiento.fechaFin) : "Fecha no disponible"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos Utilizados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos Utilizados
              </h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={agregarProducto}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Agregar Producto
              </Button>
            </div>

            {productosUsados.length === 0 ? (
              <div className="text-center p-4 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No hay productos agregados</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={agregarProducto}
                  className="mt-2"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Agregar Producto
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {productosUsados.map((producto, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label>Producto</Label>
                      <Select
                        value={producto.productoId.toString()}
                        onValueChange={(value) => actualizarProducto(index, "productoId", Number.parseInt(value))}
                        disabled={loadingProductos}
                      >
                        <SelectTrigger className="h-9">
                          {loadingProductos ? (
                            <span className="text-muted-foreground">Cargando productos...</span>
                          ) : (
                            <SelectValue placeholder="Selecciona un producto" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {productos.length === 0 ? (
                            <SelectItem value="0" disabled>
                              {loadingProductos 
                                ? "Cargando productos..." 
                                : "No hay productos disponibles"}
                            </SelectItem>
                          ) : (
                            <>
                              <SelectItem value="0">Selecciona un producto</SelectItem>
                              {productos.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id.toString()}>
                                  {prod.nombre} {prod.precio && `- $${prod.precio}`}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {producto.productoId > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Precio: ${producto.precioEnUso.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={producto.cantidadUsada}
                        onChange={(e) => actualizarProducto(index, "cantidadUsada", Number.parseInt(e.target.value))}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Subtotal</Label>
                      <Input
                        type="text"
                        value={`$${producto.subtotal.toFixed(2)}`}
                        readOnly
                        className="bg-muted cursor-not-allowed h-9"
                      />
                    </div>

                    <div className="flex items-end justify-center">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => eliminarProducto(index)}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={guardarProductos} 
                    disabled={actualizandoProductos}
                  >
                    {actualizandoProductos ? "Guardando..." : "Guardar Productos"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Total Calculado */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resumen de Facturación</h3>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total a Facturar:</span>
                <span className="font-bold text-primary">{formatCurrency(calculatedTotal.totalCalculado || 0)}</span>
              </div>
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="space-y-2">
            <Label htmlFor="detalles">Detalles Adicionales (Opcional)</Label>
            <Textarea
              id="detalles"
              placeholder="Ingrese detalles adicionales para la factura..."
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Factura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
