"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Car, Wrench, User, FileText, Package } from "lucide-react"
import type { MantenimientoResponseCliente } from "@/types/mantenimientos-cliente"

interface MantenimientoDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantenimiento: MantenimientoResponseCliente | null
}

const estadoColors = {
  SOLICITADO: "bg-blue-100 text-blue-800 border-blue-200",
  EN_PROCESO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  COMPLETADO: "bg-green-100 text-green-800 border-green-200",
  PENDIENTE: "bg-orange-100 text-orange-800 border-orange-200",
  CANCELADO: "bg-red-100 text-red-800 border-red-200",
}

export function MantenimientoDetailsModal({ open, onOpenChange, mantenimiento }: MantenimientoDetailsModalProps) {
  if (!mantenimiento) return null

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
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Detalles del Mantenimiento #{mantenimiento.id}
          </DialogTitle>
          <DialogDescription>Información completa de tu solicitud de mantenimiento</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y fechas */}
          <div className="flex items-center justify-between">
            <Badge className={estadoColors[mantenimiento.estado]}>{mantenimiento.estado.replace("_", " ")}</Badge>
            <div className="text-sm text-muted-foreground">Creado: {formatDate(mantenimiento.fechaCreacion)}</div>
          </div>

          <Separator />

          {/* Información del vehículo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-4 w-4" />
                Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Placa:</span> {mantenimiento.vehiculo.placa}
                </div>
                <div>
                  <span className="font-medium">Marca:</span> {mantenimiento.vehiculo.marca}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Modelo:</span> {mantenimiento.vehiculo.modelo}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del servicio */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-4 w-4" />
                Servicio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Servicio:</span> {mantenimiento.servicio.nombre}
                </div>
                <div>
                  <span className="font-medium">Taller:</span> {mantenimiento.servicio.taller.nombre}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del trabajador */}
          {mantenimiento.trabajador && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4" />
                  Trabajador Asignado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Nombre:</span> {mantenimiento.trabajador.usuario.nombreCompleto}
                  </div>
                  <div>
                    <span className="font-medium">Especialidad:</span> {mantenimiento.trabajador.especialidad}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fechas del mantenimiento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-4 w-4" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="font-medium">Fecha de inicio:</span> {formatDate(mantenimiento.fechaInicio)}
                </div>
                <div>
                  <span className="font-medium">Fecha de finalización:</span> {formatDate(mantenimiento.fechaFin)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Observaciones del cliente:</span>
                  <p className="mt-1 text-muted-foreground">
                    {mantenimiento.observacionesCliente || "Sin observaciones"}
                  </p>
                </div>
                {mantenimiento.observacionesTrabajador && (
                  <div>
                    <span className="font-medium">Observaciones del trabajador:</span>
                    <p className="mt-1 text-muted-foreground">{mantenimiento.observacionesTrabajador}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Productos utilizados */}
          {mantenimiento.productosUsados && mantenimiento.productosUsados.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-4 w-4" />
                  Productos Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mantenimiento.productosUsados.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{item.producto.nombre}</div>
                        <div className="text-sm text-muted-foreground">Cantidad: {item.cantidadUsada}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.precioEnUso.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Total: ${(item.cantidadUsada * item.precioEnUso).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
