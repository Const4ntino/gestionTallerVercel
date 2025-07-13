"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, Play, CheckCircle, XCircle, Calendar, User, Car, Settings, Timer } from "lucide-react"
import { mantenimientosApi } from "@/lib/mantenimientos-api"
import type { MantenimientoResponse, MantenimientoStats, MantenimientoEstado } from "@/types/mantenimientos"
import { toast } from "sonner"

interface MantenimientosDashboardProps {
  onRefresh: () => void
}

export function MantenimientosDashboard({ onRefresh }: MantenimientosDashboardProps) {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoResponse[]>([])
  const [stats, setStats] = useState<MantenimientoStats>({
    solicitado: 0,
    pendiente: 0,
    enProceso: 0,
    completado: 0,
    cancelado: 0,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    loadData()

    // Actualizar el tiempo cada segundo para el contador en tiempo real
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const data = await mantenimientosApi.getAll()
      setMantenimientos(data)

      // Calcular estadísticas
      const newStats = data.reduce(
        (acc, mantenimiento) => {
          acc.total++
          switch (mantenimiento.estado) {
            case "SOLICITADO":
              acc.solicitado++
              break
            case "PENDIENTE":
              acc.pendiente++
              break
            case "EN_PROCESO":
              acc.enProceso++
              break
            case "COMPLETADO":
              acc.completado++
              break
            case "CANCELADO":
              acc.cancelado++
              break
          }
          return acc
        },
        { solicitado: 0, pendiente: 0, enProceso: 0, completado: 0, cancelado: 0, total: 0 },
      )

      setStats(newStats)
    } catch (error) {
      toast.error("Error al cargar datos del dashboard")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateElapsedTime = (startDate: string | null) => {
    if (!startDate) return "N/A"

    const start = new Date(startDate)
    const now = currentTime
    const diffMs = now.getTime() - start.getTime()

    if (diffMs < 0) return "N/A"

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const getEstadoBadgeVariant = (estado: MantenimientoEstado) => {
    switch (estado) {
      case "SOLICITADO":
        return "secondary"
      case "PENDIENTE":
        return "outline"
      case "EN_PROCESO":
        return "default"
      case "COMPLETADO":
        return "default"
      case "CANCELADO":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getEstadoIcon = (estado: MantenimientoEstado) => {
    switch (estado) {
      case "SOLICITADO":
        return <AlertCircle className="h-4 w-4" />
      case "PENDIENTE":
        return <Clock className="h-4 w-4" />
      case "EN_PROCESO":
        return <Play className="h-4 w-4" />
      case "COMPLETADO":
        return <CheckCircle className="h-4 w-4" />
      case "CANCELADO":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTransicionesPermitidas = (estadoActual: MantenimientoEstado): MantenimientoEstado[] => {
    switch (estadoActual) {
      case "SOLICITADO":
        return ["PENDIENTE", "EN_PROCESO", "CANCELADO"]
      case "PENDIENTE":
        return ["EN_PROCESO", "CANCELADO"]
      case "EN_PROCESO":
        return ["COMPLETADO", "CANCELADO"]
      case "COMPLETADO":
      case "CANCELADO":
        return []
      default:
        return []
    }
  }

  const handleCambiarEstado = async (mantenimientoId: number, nuevoEstado: MantenimientoEstado) => {
    try {
      const mantenimiento = mantenimientos.find((m) => m.id === mantenimientoId)
      if (!mantenimiento) return

      await mantenimientosApi.update(mantenimientoId, {
        vehiculoId: mantenimiento.vehiculo.id,
        servicioId: mantenimiento.servicio.id,
        trabajadorId: mantenimiento.trabajador?.id || null,
        estado: nuevoEstado,
        observacionesCliente: mantenimiento.observacionesCliente,
        observacionesTrabajador: mantenimiento.observacionesTrabajador,
        productosUsados: mantenimiento.productosUsados.map((p) => ({
          productoId: p.producto.id,
          cantidadUsada: p.cantidadUsada,
          precioEnUso: p.precioEnUso,
        })),
      })

      toast.success(`Estado cambiado a ${nuevoEstado}`)
      loadData()
      onRefresh()
    } catch (error) {
      toast.error("Error al cambiar el estado")
      console.error(error)
    }
  }

  const mantenimientosActivos = mantenimientos.filter(
    (m) => m.estado === "SOLICITADO" || m.estado === "PENDIENTE" || m.estado === "EN_PROCESO",
  )

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitados</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.solicitado}</div>
            <p className="text-xs text-muted-foreground">Nuevas solicitudes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendiente}</div>
            <p className="text-xs text-muted-foreground">En espera</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.enProceso}</div>
            <p className="text-xs text-muted-foreground">En ejecución</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completado}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Settings className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todos los mantenimientos</p>
          </CardContent>
        </Card>
      </div>

      {/* Mantenimientos Activos */}
      <Card>
        <CardHeader>
          <CardTitle>Mantenimientos Activos</CardTitle>
          <CardDescription>Mantenimientos que requieren atención (Solicitados, Pendientes, En Proceso)</CardDescription>
        </CardHeader>
        <CardContent>
          {mantenimientosActivos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay mantenimientos activos en este momento</p>
          ) : (
            <div className="space-y-4">
              {mantenimientosActivos.map((mantenimiento) => (
                <div key={mantenimiento.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getEstadoIcon(mantenimiento.estado)}
                      <Badge variant={getEstadoBadgeVariant(mantenimiento.estado)}>{mantenimiento.estado}</Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Car className="h-3 w-3" />
                        <span className="font-medium">{mantenimiento.vehiculo.placa}</span>
                        <span className="text-muted-foreground">
                          {mantenimiento.vehiculo.marca} {mantenimiento.vehiculo.modelo}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Settings className="h-3 w-3" />
                        <span>{mantenimiento.servicio.nombre}</span>
                      </div>

                      {mantenimiento.trabajador && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{mantenimiento.trabajador.usuario.nombreCompleto}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateTime(mantenimiento.fechaCreacion)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Información de fecha de inicio y tiempo transcurrido */}
                  <div className="flex flex-col items-end space-y-2 min-w-[200px]">
                    {mantenimiento.fechaInicio && (
                      <div className="text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Inicio: {formatDateTime(mantenimiento.fechaInicio)}</span>
                        </div>
                        {mantenimiento.estado === "EN_PROCESO" && (
                          <div className="flex items-center space-x-2 text-blue-600 font-medium mt-1">
                            <Timer className="h-3 w-3" />
                            <span>Transcurrido: {calculateElapsedTime(mantenimiento.fechaInicio)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {getTransicionesPermitidas(mantenimiento.estado).map((nuevoEstado) => (
                        <Button
                          key={nuevoEstado}
                          size="sm"
                          variant={nuevoEstado === "CANCELADO" ? "destructive" : "default"}
                          onClick={() => handleCambiarEstado(mantenimiento.id, nuevoEstado)}
                        >
                          {nuevoEstado === "PENDIENTE" && "Aceptar"}
                          {nuevoEstado === "EN_PROCESO" && "Iniciar"}
                          {nuevoEstado === "COMPLETADO" && "Completar"}
                          {nuevoEstado === "CANCELADO" && "Cancelar"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
