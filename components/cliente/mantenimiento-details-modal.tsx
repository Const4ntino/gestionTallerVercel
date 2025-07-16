"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, User, Car, Wrench, FileText, Package } from "lucide-react"
import { obtenerMantenimiento } from "@/lib/mantenimientos-cliente-api"
import type { MantenimientoResponseCliente } from "@/types/mantenimientos-cliente"
import { toast } from "sonner"

interface MantenimientoDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantenimientoId: number | null
}

export function MantenimientoDetailsModal({ open, onOpenChange, mantenimientoId }: MantenimientoDetailsModalProps) {
  const [mantenimiento, setMantenimiento] = useState<MantenimientoResponseCliente | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && mantenimientoId) {
      cargarMantenimiento()
    }
  }, [open, mantenimientoId])

  const cargarMantenimiento = async () => {
    if (!mantenimientoId) return

    setIsLoading(true)
    try {
      const data = await obtenerMantenimiento(mantenimientoId)
      setMantenimiento(data)
    } catch (error) {
      toast.error("Error al cargar detalles del mantenimiento")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "SOLICITADO":
        return <Badge variant="secondary">Solicitado</Badge>
      case "PENDIENTE":
        return <Badge variant="outline">Pendiente</Badge>
      case "EN_PROCESO":
        return (
          <Badge variant="default" className="bg-blue-500">
            En Proceso
          </Badge>
        )
      case "COMPLETADO":
        return (
          <Badge variant="default" className="bg-green-500">
            Completado
          </Badge>
        )
      case "CANCELADO":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No definida"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Mantenimiento</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : mantenimiento ? (
          <div className="space-y-6">
            {/* Estado y fechas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Estado del Mantenimiento</CardTitle>
                  {getEstadoBadge(mantenimiento.estado)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Solicitud</p>
                      <p className="text-sm text-muted-foreground">{formatDate(mantenimiento.fechaCreacion)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Inicio</p>
                      <p className="text-sm text-muted-foreground">{formatDate(mantenimiento.fechaInicio)}</p>
                    </div>
                  </div>
                </div>
                {mantenimiento.fechaFin && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Finalización</p>
                      <p className="text-sm text-muted-foreground">{formatDate(mantenimiento.fechaFin)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del vehículo y servicio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehículo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Placa:</span> {mantenimiento.vehiculo.placa}
                    </p>
                    <p>
                      <span className="font-medium">Marca:</span> {mantenimiento.vehiculo.marca}
                    </p>
                    <p>
                      <span className="font-medium">Modelo:</span> {mantenimiento.vehiculo.modelo}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Servicio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Servicio:</span> {mantenimiento.servicio.nombre}
                    </p>
                    <p>
                      <span className="font-medium">Taller:</span> {mantenimiento.servicio.taller.nombre}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trabajador asignado */}
            {mantenimiento.trabajador && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Trabajador Asignado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Nombre:</span> {mantenimiento.trabajador.usuario.nombreCompleto}
                    </p>
                    <p>
                      <span className="font-medium">Especialidad:</span> {mantenimiento.trabajador.especialidad}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mantenimiento.observacionesCliente && (
                  <div>
                    <p className="font-medium text-sm mb-2">Observaciones del Cliente:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {mantenimiento.observacionesCliente}
                    </p>
                  </div>
                )}
                {mantenimiento.observacionesTrabajador && (
                  <div>
                    <p className="font-medium text-sm mb-2">Observaciones del Trabajador:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {mantenimiento.observacionesTrabajador}
                    </p>
                  </div>
                )}
                {!mantenimiento.observacionesCliente && !mantenimiento.observacionesTrabajador && (
                  <p className="text-sm text-muted-foreground">No hay observaciones registradas.</p>
                )}
              </CardContent>
            </Card>

            {/* Productos utilizados */}
            {mantenimiento.productosUsados.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos Utilizados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mantenimiento.productosUsados.map((producto, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">{producto.producto.nombre}</p>
                          <p className="text-sm text-muted-foreground">Cantidad: {producto.cantidadUsada}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${producto.precioEnUso.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            Total: ${(producto.cantidadUsada * producto.precioEnUso).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se pudo cargar la información del mantenimiento.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
