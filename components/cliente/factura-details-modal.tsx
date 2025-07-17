"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download, FileText, Calendar, DollarSign, Car, Wrench, Building2 } from "lucide-react"
import { obtenerDetallesFactura, formatearFecha, formatearMoneda } from "@/lib/facturas-cliente-api"
import { toast } from "@/hooks/use-toast"
import type { FacturaClienteResponse } from "@/types/facturas-cliente"

interface FacturaDetailsModalProps {
  facturaId: number | null
  isOpen: boolean
  onClose: () => void
}

export function FacturaDetailsModal({ facturaId, isOpen, onClose }: FacturaDetailsModalProps) {
  const [factura, setFactura] = useState<FacturaClienteResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && facturaId) {
      loadFacturaDetails()
    }
  }, [isOpen, facturaId])

  const loadFacturaDetails = async () => {
    if (!facturaId) return

    setLoading(true)
    try {
      console.log("Cargando detalles de factura:", facturaId)
      const data = await obtenerDetallesFactura(facturaId)
      setFactura(data)
    } catch (error) {
      console.error("Error al cargar detalles de factura:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la factura",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (factura?.pdfUrl) {
      window.open(factura.pdfUrl, "_blank")
    } else {
      toast({
        title: "PDF no disponible",
        description: "El archivo PDF de esta factura no está disponible",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setFactura(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de Factura {facturaId ? `#${facturaId}` : ""}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : factura ? (
          <div className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Fecha de Emisión:</span>
                    <span className="text-sm">{formatearFecha(factura.fechaEmision)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total:</span>
                    <Badge variant="secondary" className="font-semibold">
                      {formatearMoneda(factura.total)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Taller:</span>
                    <span className="text-sm">{factura.taller?.nombre || "N/A"}</span>
                  </div>
                  {factura.pdfUrl && (
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto bg-transparent"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información del Mantenimiento */}
            {factura.mantenimiento && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Detalles del Mantenimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Vehículo:</span>
                        <span className="text-sm">
                          {factura.mantenimiento.vehiculo?.placa || "N/A"} -{" "}
                          {factura.mantenimiento.vehiculo?.marca || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Servicio:</span>
                        <span className="text-sm">{factura.mantenimiento.servicio?.nombre || "N/A"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Estado:</span>
                        <Badge variant={factura.mantenimiento.estado === "COMPLETADO" ? "default" : "secondary"}>
                          {factura.mantenimiento.estado || "N/A"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Precio Base:</span>
                        <span className="text-sm">
                          {factura.mantenimiento.servicio?.precioBase
                            ? formatearMoneda(factura.mantenimiento.servicio.precioBase)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {factura.mantenimiento.observacionesTrabajador && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Observaciones del Trabajador:</span>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {factura.mantenimiento.observacionesTrabajador}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Productos Utilizados */}
            {factura.mantenimiento?.productosUsados && factura.mantenimiento.productosUsados.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Productos Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {factura.mantenimiento.productosUsados.map((productoUsado, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <div className="space-y-1">
                          <span className="font-medium">{productoUsado.producto?.nombre || "Producto sin nombre"}</span>
                          <div className="text-sm text-muted-foreground">
                            Cantidad: {productoUsado.cantidadUsada || 0}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatearMoneda(productoUsado.precioEnUso || 0)}</div>
                          <div className="text-sm text-muted-foreground">por unidad</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total de la Factura:</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {formatearMoneda(factura.total)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detalles adicionales */}
            {factura.detalles && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalles Adicionales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{factura.detalles}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se pudieron cargar los detalles de la factura</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
