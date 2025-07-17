"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Clock, AlertCircle, CheckCircle, Wrench } from "lucide-react"
import { mantenimientosTallerApi } from "@/lib/mantenimientos-admin-taller-api"
import type { MantenimientoResponse, MantenimientoEstado } from "@/types/mantenimientos"
import { toast } from "sonner"

interface MantenimientosTallerDashboardProps {
  onRefresh: () => void
}

export function MantenimientosTallerDashboard({ onRefresh }: MantenimientosTallerDashboardProps) {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    solicitado: 0,
    pendiente: 0,
    enProceso: 0,
    completado: 0,
    cancelado: 0,
    total: 0,
  })

  useEffect(() => {
    loadMantenimientos()
  }, [])

  const loadMantenimientos = async () => {
    try {
      setIsLoading(true)
      const response = await mantenimientosTallerApi.filter({
        page: 0,
        size: 100,
        sort: "fechaCreacion,desc",
      })

      const data = response.content
      setMantenimientos(data)

      // Calcular estadísticas
      const newStats = {
        solicitado: data.filter((m) => m.estado === "SOLICITADO").length,
        pendiente: data.filter((m) => m.estado === "PENDIENTE").length,
        enProceso: data.filter((m) => m.estado === "EN_PROCESO").length,
        completado: data.filter((m) => m.estado === "COMPLETADO").length,
        cancelado: data.filter((m) => m.estado === "CANCELADO").length,
        total: data.length,
      }
      setStats(newStats)
    } catch (error) {
      toast.error("Error al cargar mantenimientos")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadMantenimientos()
    onRefresh()
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const mantenimientosActivos = mantenimientos.filter((m) =>
    ["SOLICITADO", "PENDIENTE", "EN_PROCESO"].includes(m.estado),
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
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
            <Wrench className="h-4 w-4 text-blue-600" />
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
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todos los mantenimientos</p>
          </CardContent>
        </Card>
      </div>

      {/* Mantenimientos Activos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mantenimientos Activos</CardTitle>
            <CardDescription>
              Mantenimientos que requieren atención (Solicitados, Pendientes, En Proceso)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {mantenimientosActivos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay mantenimientos activos en este momento</div>
          ) : (
            <div className="space-y-4">
              {mantenimientosActivos.slice(0, 10).map((mantenimiento) => (
                <div
                  key={mantenimiento.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">#{mantenimiento.id}</span>
                      <Badge variant={getEstadoBadgeVariant(mantenimiento.estado)}>{mantenimiento.estado}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Vehículo:</span> {mantenimiento.vehiculo.placa} -{" "}
                        {mantenimiento.vehiculo.marca} {mantenimiento.vehiculo.modelo}
                      </div>
                      <div>
                        <span className="font-medium">Cliente:</span>{" "}
                        {mantenimiento.vehiculo.cliente.usuario.nombreCompleto}
                      </div>
                      <div>
                        <span className="font-medium">Servicio:</span> {mantenimiento.servicio.nombre}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Creado: {formatDateTime(mantenimiento.fechaCreacion)}
                    </div>
                  </div>
                </div>
              ))}
              {mantenimientosActivos.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  Y {mantenimientosActivos.length - 10} mantenimientos más...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
