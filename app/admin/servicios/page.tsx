"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, DollarSign, Clock, Eye } from "lucide-react"
import { serviciosApi } from "@/lib/servicios-api"
import { talleresApi } from "@/lib/admin-api"
import type { ServicioResponse, PageResponse, TallerResponse } from "@/types/servicios"
import { toast } from "sonner"
import { ServicioFormModal } from "@/components/admin/forms/servicio-form-modal"
import { AdvancedFilters } from "@/components/admin/advanced-filters"
import { DetailsModal } from "@/components/admin/details-modal"

interface FilterParams {
  search?: string
  tallerId?: string
  minPrecioBase?: string
  maxPrecioBase?: string
  minDuracionEstimadaHoras?: string
  maxDuracionEstimadaHoras?: string
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<ServicioResponse[]>([])
  const [pagination, setPagination] = useState<PageResponse<ServicioResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedServicio, setSelectedServicio] = useState<ServicioResponse | null>(null)
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({})
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedServicioDetails, setSelectedServicioDetails] = useState<ServicioResponse | null>(null)

  useEffect(() => {
    loadTalleres()
  }, [])

  useEffect(() => {
    loadServicios(currentPage, pageSize, currentFilters)
  }, [currentPage, pageSize, currentFilters])

  const loadTalleres = async () => {
    try {
      const response = await talleresApi.getAll()
      setTalleres(response)
    } catch (error) {
      console.error("Error al cargar talleres:", error)
    }
  }

  const serviciosFilterConfig = [
    { key: "search", label: "Búsqueda General", type: "text" as const },
    { key: "minPrecioBase", label: "Precio Base Mínimo", type: "text" as const },
    { key: "maxPrecioBase", label: "Precio Base Máximo", type: "text" as const },
    { key: "minDuracionEstimadaHoras", label: "Duración Mínima (horas)", type: "text" as const },
    { key: "maxDuracionEstimadaHoras", label: "Duración Máxima (horas)", type: "text" as const },
  ]

  const additionalData = {
    tallerId: talleres.map((taller) => ({
      value: taller.id.toString(),
      label: `${taller.nombre} - ${taller.ciudad}`,
    })),
  }

  const loadServicios = async (page = 0, size = 10, filters: FilterParams = {}) => {
    try {
      setIsLoading(true)
      const response = await serviciosApi.filter({
        page,
        size,
        sort: "nombre,asc",
        ...filters,
      })
      setPagination(response)
      setServicios(response.content)
    } catch (error) {
      toast.error("Error al cargar servicios")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    setCurrentPage(0)
    loadServicios(0, pageSize, { ...currentFilters, search })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      try {
        await serviciosApi.delete(id)
        toast.success("Servicio eliminado correctamente")
        loadServicios(currentPage, pageSize, currentFilters)
      } catch (error) {
        toast.error("Error al eliminar servicio")
        console.error(error)
      }
    }
  }

  const getDuracionBadgeVariant = (horas: number) => {
    if (horas <= 1) return "default"
    if (horas <= 3) return "secondary"
    return "destructive"
  }

  const columns = [
    {
      key: "id",
      header: "ID",
    },
    {
      key: "nombre",
      header: "Nombre del Servicio",
    },
    {
      key: "taller.nombre",
      header: "Taller",
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (servicio: ServicioResponse) => (
        <span className="truncate max-w-[150px] block" title={servicio.descripcion}>
          {servicio.descripcion}
        </span>
      ),
    },
    {
      key: "precioBase",
      header: "Precio Base",
      render: (servicio: ServicioResponse) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span className="font-medium">{servicio.precioBase.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: "duracionEstimadaHoras",
      header: "Duración",
      render: (servicio: ServicioResponse) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <Badge variant={getDuracionBadgeVariant(servicio.duracionEstimadaHoras)}>
            {servicio.duracionEstimadaHoras}h
          </Badge>
        </div>
      ),
    },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (servicio: ServicioResponse) => new Date(servicio.fechaCreacion).toLocaleDateString(),
    },
  ]

  const actions = (servicio: ServicioResponse) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedServicio(servicio)
          setModalOpen(true)
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        disabled={true}
        title="La eliminación de servicios está deshabilitada"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const handleApplyFilters = (filters: FilterParams) => {
    setCurrentFilters(filters)
    setCurrentPage(0)
    loadServicios(0, pageSize, filters)
  }

  const handleClearFilters = () => {
    setCurrentFilters({})
    setCurrentPage(0)
    loadServicios(0, pageSize, {})
  }

  const handleViewDetails = (servicio: ServicioResponse) => {
    setSelectedServicioDetails(servicio)
    setDetailsModalOpen(true)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Servicios</h2>
            <p className="text-muted-foreground">Gestiona todos los servicios ofrecidos por los talleres</p>
          </div>
          <div className="flex gap-2">
            <AdvancedFilters
              filters={[
                ...serviciosFilterConfig,
                {
                  key: "tallerId",
                  label: "Taller",
                  type: "select" as const,
                },
              ]}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              additionalData={additionalData}
            />
            <Button
              onClick={() => {
                setSelectedServicio(null)
                setModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Servicio
            </Button>
          </div>
        </div>

        <DataTable
          data={servicios}
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
      </div>
      <ServicioFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        servicio={selectedServicio}
        onSuccess={() => loadServicios(currentPage, pageSize, currentFilters)}
      />
      <DetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        title="Detalles del Servicio"
        description="Información completa del servicio seleccionado"
        fields={
          selectedServicioDetails
            ? [
                { label: "ID", value: selectedServicioDetails.id },
                { label: "Nombre", value: selectedServicioDetails.nombre },
                { label: "Taller", value: selectedServicioDetails.taller.nombre },
                { label: "Ciudad del Taller", value: selectedServicioDetails.taller.ciudad },
                { label: "Descripción Completa", value: selectedServicioDetails.descripcion },
                { label: "Precio Base", value: selectedServicioDetails.precioBase, type: "currency" },
                { label: "Duración Estimada", value: `${selectedServicioDetails.duracionEstimadaHoras} horas` },
                { label: "Fecha de Creación", value: selectedServicioDetails.fechaCreacion, type: "date" },
                { label: "Última Actualización", value: selectedServicioDetails.fechaActualizacion, type: "date" },
              ]
            : []
        }
      />
    </AdminLayout>
  )
}
