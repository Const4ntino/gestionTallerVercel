"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { FacturaClienteResponse } from "@/types/facturas-cliente"
import { obtenerDetallesFactura, formatearFecha, formatearMoneda } from "@/lib/facturas-cliente-api"
import { Download, FileText, Car, Wrench, Package } from "lucide-react"
import { toast } from "sonner"

interface FacturaDetailsModalProps {
  facturaId: number | null
  isOpen: boolean
  onClose: () => void
}

export function FacturaDetailsModal({ facturaId, isOpen, onClose }: FacturaDetailsModalProps) {
  const [factura, setFactura] = useState<FacturaClienteResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const cargarDetalles = async () => {
    if (!facturaId) return

    setLoading(true)
    try {
      const detalles = await obtenerDetallesFactura(facturaId)
      setFactura(detalles)
    } catch (error) {
      console.error("Error al cargar detalles:", error)
      toast.error("Error al cargar los detalles de la factura")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open && facturaId) {
      cargarDetalles()
    } else {
      setFactura(null)
    }
    if (!open) {
      onClose()
    }
  }

  const handleDescargarPDF = () => {
    if (factura?.pdfUrl) {
      window.open(factura.pdfUrl, "_blank")
    } else {
      toast.error("PDF no disponible")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de Factura #{facturaId}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : factura ? (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6">
              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de Emisión</p>
                      <p className="text-sm">{formatearFecha(factura.fechaEmision)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-primary">{formatearMoneda(factura.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taller</p>
                      <p className="text-sm">{factura.taller.nombre}</p>
                      <p className="text-xs text-muted-foreground">{factura.taller.direccion}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                      <p className="text-sm">{factura.cliente.usuario.nombreCompleto}</p>
                      <p className="text-xs text-muted-foreground">{factura.cliente.usuario.email}</p>
                    </div>
                  </div>
                  {factura.detalles && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Detalles</p>
                      <p className="text-sm">{factura.detalles}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información del Vehículo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehículo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Placa</p>
                      <p className="text-sm font-mono">{factura.mantenimiento.vehiculo.placa}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Marca</p>
                      <p className="text-sm">{factura.mantenimiento.vehiculo.marca}</p>
                    </div>
                    {factura.mantenimiento.vehiculo.modelo && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                        <p className="text-sm">{factura.mantenimiento.vehiculo.modelo}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Información del Servicio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Servicio Realizado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Servicio</p>
                      <p className="text-sm font-medium">{factura.mantenimiento.servicio.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Precio Base</p>
                      <p className="text-sm">{formatearMoneda(factura.mantenimiento.servicio.precioBase)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge variant={factura.mantenimiento.estado === "COMPLETADO" ? "default" : "secondary"}>
                      {factura.mantenimiento.estado}
                    </Badge>
                  </div>
                  {factura.mantenimiento.observacionesTrabajador && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Observaciones del Trabajador</p>
                      <p className="text-sm bg-muted p-3 rounded-md">{factura.mantenimiento.observacionesTrabajador}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Productos Utilizados */}
              {factura.mantenimiento.productosUsados && factura.mantenimiento.productosUsados.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Productos Utilizados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {factura.mantenimiento.productosUsados.map((producto, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md">
                          <div>
                            <p className="text-sm font-medium">{producto.producto.nombre}</p>
                            <p className="text-xs text-muted-foreground">Cantidad: {producto.cantidadUsada}</p>
                          </div>
                          <p className="text-sm font-medium">{formatearMoneda(producto.precioEnUso)}</p>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Subtotal Productos:</p>
                      <p className="text-sm font-medium">
                        {formatearMoneda(
                          factura.mantenimiento.productosUsados.reduce(
                            (sum, p) => sum + p.precioEnUso * p.cantidadUsada,
                            0,
                          ),
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resumen de Costos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Costos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Servicio:</span>
                    <span className="text-sm">{formatearMoneda(factura.mantenimiento.servicio.precioBase)}</span>
                  </div>
                  {factura.mantenimiento.productosUsados && factura.mantenimiento.productosUsados.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Productos:</span>
                      <span className="text-sm">
                        {formatearMoneda(
                          factura.mantenimiento.productosUsados.reduce(
                            (sum, p) => sum + p.precioEnUso * p.cantidadUsada,
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatearMoneda(factura.total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Botón de Descarga */}
              {factura.pdfUrl && (
                <div className="flex justify-center">
                  <Button onClick={handleDescargarPDF} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
