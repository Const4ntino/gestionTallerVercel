"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertasFilters } from "@/components/cliente/alertas-filters"
import { AlertaCard } from "@/components/cliente/alerta-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, BellOff, ChevronLeft, ChevronRight } from "lucide-react"
import { alertasClienteApi } from "@/lib/alertas-cliente-api"
import type { AlertaResponse, AlertaFilters } from "@/types/alertas-cliente"
import { toast } from "sonner"

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [filters, setFilters] = useState<AlertaFilters>({
    page: 0,
    size: 10,
    estado: "NUEVA", // Por defecto mostrar solo nuevas
    sort: "fechaCreacion,desc",
  })

  useEffect(() => {
    cargarAlertas()
  }, [])

  const cargarAlertas = async () => {
    try {
      setLoading(true)
      console.log("🔄 Cargando alertas con filtros:", filters)
      const response = await alertasClienteApi.obtenerMisAlertas(filters)
      setAlertas(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Error al cargar alertas:", error)
      toast.error("Error al cargar las alertas")
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: AlertaFilters) => {
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 0 }))
    cargarAlertas()
  }

  const handleMarcarVista = async (alertaId: number) => {
    try {
      setActionLoading(true)
      await alertasClienteApi.marcarComoVista(alertaId)
      toast.success("Alerta marcada como leída")
      await cargarAlertas() // Recargar la lista
    } catch (error) {
      console.error("Error al marcar como vista:", error)
      toast.error("Error al marcar la alerta como leída")
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarcarResuelta = async (alertaId: number) => {
    try {
      setActionLoading(true)
      await alertasClienteApi.marcarComoResuelta(alertaId)
      toast.success("Alerta archivada correctamente")
      await cargarAlertas() // Recargar la lista
    } catch (error) {
      console.error("Error al marcar como resuelta:", error)
      toast.error("Error al archivar la alerta")
    } finally {
      setActionLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    setTimeout(cargarAlertas, 100)
  }

  const AlertasSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-3 w-48 mb-4" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mis Alertas</h1>
          <p className="text-muted-foreground">Gestiona las notificaciones de tus vehículos y mantenimientos</p>
        </div>
      </div>

      {/* Filtros */}
      <AlertasFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        isLoading={loading}
      />

      {/* Contenido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {totalElements > 0
                ? `${totalElements} alerta${totalElements !== 1 ? "s" : ""} encontrada${totalElements !== 1 ? "s" : ""}`
                : "Alertas"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AlertasSkeleton />
          ) : alertas.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes alertas</h3>
              <p className="text-muted-foreground">
                {filters.estado === "NUEVA"
                  ? "No tienes notificaciones nuevas pendientes."
                  : "No se encontraron alertas con los filtros aplicados."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <AlertaCard
                  key={alerta.id}
                  alerta={alerta}
                  onMarcarVista={handleMarcarVista}
                  onMarcarResuelta={handleMarcarResuelta}
                  isLoading={actionLoading}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {(filters.page || 0) + 1} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 0) - 1)}
                  disabled={loading || (filters.page || 0) === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 0) + 1)}
                  disabled={loading || (filters.page || 0) >= totalPages - 1}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
