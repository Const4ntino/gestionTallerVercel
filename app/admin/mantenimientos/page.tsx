"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, LayoutDashboard, List } from "lucide-react"
import {
  mantenimientosApi,
  vehiculosApi,
  serviciosMantenimientoApi,
  trabajadoresMantenimientoApi,
} from "@/lib/mantenimientos-api"
import type { MantenimientoResponse, PageResponse, MantenimientoEstado } from "@/types/mantenimientos"
import { toast } from "sonner"
import { MantenimientoFormModal } from "@/components/admin/forms/mantenimiento-form-modal"
import { MantenimientosDashboard } from "@/components/admin/mantenimientos/mantenimientos-dashboard"
import { AdvancedFilters } from "@/components/admin/advanced-filters"
import { DetailsModal } from "@/components/admin/details-modal"

interface FilterParams {
  search?: string
  vehiculoId?: string
  servicioId?: string
  trabajadorId?: string
  estado?: MantenimientoEstado
  fechaInicioDesde?: string
  fechaInicioHasta?: string
  fechaFinDesde?: string
  fechaFinHasta?: string
}

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoResponse[]>([])
  const [pagination, setPagination] = useState<PageResponse<MantenimientoResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MantenimientoResponse | null>(null)
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({})
  const [refreshKey, setRefreshKey] = useState(0)

  // Datos auxiliares para filtros
  const [vehiculos, setVehiculos] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [trabajadores, setTrabajadores] = useState<any[]>([])

  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedMantenimientoDetails, setSelectedMantenimientoDetails] = useState<MantenimientoResponse | null>(null)

  useEffect(() => {
    loadAuxiliaryData()
  }, [])

  useEffect(() => {
    loadMantenimientos(currentPage, pageSize, currentFilters)
  }, [currentPage, pageSize, currentFilters, refreshKey])

  const loadAuxiliaryData = async () => {
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
      console.error("Error al cargar datos auxiliares:", error)
    }
  }

  const mantenimientosFilterConfig = [
    { key: "search", label: "Búsqueda General", type: "text" as const },
    { key: "fechaInicioDesde", label: "Fecha Inicio Desde", type: "date" as const },
    { key: "fechaInicioHasta", label: "Fecha Inicio Hasta", type: "date" as const },
    { key: "fechaFinDesde", label: "Fecha Fin Desde", type: "date" as const },
    { key: "fechaFinHasta", label: "Fecha Fin Hasta", type: "date" as const },
  ]

  const additionalData = {
    vehiculoId: vehiculos.map((vehiculo) => ({
      value: vehiculo.id.toString(),
      label: `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`,
    })),
    servicioId: servicios.map((servicio) => ({
      value: servicio.id.toString(),
      label: `${servicio.nombre} - ${servicio.taller.nombre}`,
    })),
    trabajadorId: trabajadores.map((trabajador) => ({
      value: trabajador.id.toString(),
      label: `${trabajador.usuario.nombreCompleto} - ${trabajador.especialidad}`,
    })),
    estado: [
      { value: "SOLICITADO", label: "Solicitado" },
      { value: "PENDIENTE", label: "Pendiente" },
      { value: "EN_PROCESO", label: "En Proceso" },
      { value: "COMPLETADO", label: "Completado" },
      { value: "CANCELADO", label: "Cancelado" },
    ],
  }

  const loadMantenimientos = async (page = 0, size = 10, filters: FilterParams = {}) => {
    try {
      setIsLoading(true)
      const response = await mantenimientosApi.filter({
        page,
        size,
        sort: "fechaCreacion,desc",
        ...filters,
      })
      setPagination(response)
      setMantenimientos(response.content)
    } catch (error) {
      toast.error("Error al cargar mantenimientos")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    setCurrentPage(0)
    loadMantenimientos(0, pageSize, { ...currentFilters, search })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este mantenimiento?")) {
      try {
        await mantenimientosApi.delete(id)
        toast.success("Mantenimiento eliminado correctamente")
        loadMantenimientos(currentPage, pageSize, currentFilters)
        setRefreshKey((prev) => prev + 1)
      } catch (error) {
        toast.error("Error al eliminar mantenimiento")
        console.error(error)
      }
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

  const columns = [
    {
      key: "id",
      header: "ID",
    },
    {
      key: "vehiculo",
      header: "Vehículo",
      render: (mantenimiento: MantenimientoResponse) => (
        <div className="min-w-[120px]">
          <div className="font-medium">{mantenimiento.vehiculo.placa}</div>
          <div className="text-xs text-muted-foreground">
            {mantenimiento.vehiculo.marca} {mantenimiento.vehiculo.modelo}
          </div>
        </div>
      ),
    },
    {
      key: "servicio.nombre",
      header: "Servicio",
      render: (mantenimiento: MantenimientoResponse) => (
        <span className="truncate max-w-[150px] block" title={mantenimiento.servicio.nombre}>
          {mantenimiento.servicio.nombre}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (mantenimiento: MantenimientoResponse) => (
        <Badge variant={getEstadoBadgeVariant(mantenimiento.estado)}>{mantenimiento.estado}</Badge>
      ),
    },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (mantenimiento: MantenimientoResponse) => new Date(mantenimiento.fechaCreacion).toLocaleDateString(),
    },
  ]

  const actions = (mantenimiento: MantenimientoResponse) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedMantenimiento(mantenimiento)
          setModalOpen(true)
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleDelete(mantenimiento.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const handleApplyFilters = (filters: FilterParams) => {
    setCurrentFilters(filters)
    setCurrentPage(0)
    loadMantenimientos(0, pageSize, filters)
  }

  const handleClearFilters = () => {
    setCurrentFilters({})
    setCurrentPage(0)
    loadMantenimientos(0, pageSize, {})
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleViewDetails = (mantenimiento: MantenimientoResponse) => {
    setSelectedMantenimientoDetails(mantenimiento)
    setDetailsModalOpen(true)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Mantenimientos</h2>
          <p className="text-muted-foreground">Panel integral para la gestión de mantenimientos vehiculares</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard en Vivo
            </TabsTrigger>
            <TabsTrigger value="listado" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Listado Detallado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <MantenimientosDashboard onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="listado" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Todos los Mantenimientos</h3>
                <p className="text-sm text-muted-foreground">Historial completo con filtros avanzados y paginación</p>
              </div>
              <div className="flex gap-2">
                <AdvancedFilters
                  filters={[
                    ...mantenimientosFilterConfig,
                    { key: "vehiculoId", label: "Vehículo", type: "select" as const },
                    { key: "servicioId", label: "Servicio", type: "select" as const },
                    { key: "trabajadorId", label: "Trabajador", type: "select" as const },
                    { key: "estado", label: "Estado", type: "select" as const },
                  ]}
                  onApplyFilters={handleApplyFilters}
                  onClearFilters={handleClearFilters}
                  additionalData={additionalData}
                />
                <Button
                  onClick={() => {
                    setSelectedMantenimiento(null)
                    setModalOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Mantenimiento
                </Button>
              </div>
            </div>

            <DataTable
              data={mantenimientos}
              columns={columns}
              totalPages={pagination?.totalPages || 0}
              currentPage={currentPage}
              totalElements={pagination?.totalElements || 0}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              onPageSizeChange={handlePageSizeChange}
              pageSize={pageSize}
              isLoading={isLoading}
              actions={actions}
              showDetails={true}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
        </Tabs>
      </div>

      <MantenimientoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mantenimiento={selectedMantenimiento}
        onSuccess={() => {
          loadMantenimientos(currentPage, pageSize, currentFilters)
          handleRefresh()
        }}
      />

      <DetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        title="Detalles del Mantenimiento"
        description="Información completa del mantenimiento seleccionado"
        fields={
          selectedMantenimientoDetails
            ? [
                { label: "ID", value: selectedMantenimientoDetails.id },
                {
                  label: "Vehículo",
                  value: `${selectedMantenimientoDetails.vehiculo.placa} - ${selectedMantenimientoDetails.vehiculo.marca} ${selectedMantenimientoDetails.vehiculo.modelo}`,
                },
                { label: "Cliente", value: selectedMantenimientoDetails.vehiculo.cliente.usuario.nombreCompleto },
                { label: "Servicio", value: selectedMantenimientoDetails.servicio.nombre },
                { label: "Taller", value: selectedMantenimientoDetails.servicio.taller.nombre },
                {
                  label: "Trabajador",
                  value: selectedMantenimientoDetails.trabajador?.usuario.nombreCompleto || "Sin asignar",
                },
                { label: "Especialidad", value: selectedMantenimientoDetails.trabajador?.especialidad || "N/A" },
                {
                  label: "Estado",
                  value: selectedMantenimientoDetails.estado,
                  type: "badge",
                  variant: getEstadoBadgeVariant(selectedMantenimientoDetails.estado),
                },
                { label: "Fecha de Inicio", value: selectedMantenimientoDetails.fechaInicio, type: "date" },
                { label: "Fecha de Fin", value: selectedMantenimientoDetails.fechaFin, type: "date" },
                {
                  label: "Observaciones del Cliente",
                  value: selectedMantenimientoDetails.observacionesCliente || "Sin observaciones",
                },
                {
                  label: "Observaciones del Trabajador",
                  value: selectedMantenimientoDetails.observacionesTrabajador || "Sin observaciones",
                },
                {
                  label: "Productos Usados",
                  value:
                    selectedMantenimientoDetails.productosUsados.length > 0
                      ? `${selectedMantenimientoDetails.productosUsados.length} productos`
                      : "Sin productos",
                },
                { label: "Fecha de Creación", value: selectedMantenimientoDetails.fechaCreacion, type: "date" },
                { label: "Última Actualización", value: selectedMantenimientoDetails.fechaActualizacion, type: "date" },
              ]
            : []
        }
      />
    </AdminLayout>
  )
}
