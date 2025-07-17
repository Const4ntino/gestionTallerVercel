"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { trabajadoresApi, talleresApi } from "@/lib/admin-api"
import type { TrabajadorResponse, PageResponse, TallerResponse } from "@/types/admin"
import { toast } from "sonner"
import { TrabajadorFormModal } from "@/components/admin/forms/trabajador-form-modal"
import { AdvancedFilters } from "@/components/admin/advanced-filters"

interface FilterParams {
  search?: string
  especialidad?: string
  fechaCreacionDesde?: string
  fechaCreacionHasta?: string
  tallerId?: string
}

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState<TrabajadorResponse[]>([])
  const [pagination, setPagination] = useState<PageResponse<TrabajadorResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTrabajador, setSelectedTrabajador] = useState<TrabajadorResponse | null>(null)
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({})
  const [talleres, setTalleres] = useState<TallerResponse[]>([])

  useEffect(() => {
    loadTalleres()
  }, [])

  const loadTalleres = async () => {
    try {
      const response = await talleresApi.getAll()
      setTalleres(response)
    } catch (error) {
      console.error("Error al cargar talleres:", error)
    }
  }

  const trabajadorFilters = [
    { key: "search", label: "Búsqueda General", type: "text" as const },
    { key: "especialidad", label: "Especialidad", type: "text" as const },
    { key: "fechaCreacionDesde", label: "Fecha Creación Desde", type: "date" as const },
    { key: "fechaCreacionHasta", label: "Fecha Creación Hasta", type: "date" as const },
  ]

  const additionalData = {
    tallerId: talleres.map((taller) => ({
      value: taller.id.toString(),
      label: `${taller.nombre} - ${taller.ciudad}`,
    })),
  }

  const loadTrabajadores = async (page = 0, size = 10, filters: FilterParams = {}) => {
    try {
      setIsLoading(true)
      const response = await trabajadoresApi.filter({
        page,
        size,
        sort: "fechaCreacion,desc",
        ...filters,
      })
      setPagination(response)
      setTrabajadores(response.content)
    } catch (error) {
      toast.error("Error al cargar trabajadores")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTrabajadores(currentPage, pageSize, currentFilters)
  }, [currentPage, pageSize, currentFilters])

  const handleSearch = (search: string) => {
    setCurrentPage(0)
    loadTrabajadores(0, pageSize, { ...currentFilters, search })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este trabajador?")) {
      try {
        await trabajadoresApi.delete(id)
        toast.success("Trabajador eliminado correctamente")
        loadTrabajadores(currentPage, pageSize, currentFilters)
      } catch (error) {
        toast.error("Error al eliminar trabajador")
        console.error(error)
      }
    }
  }

  const columns = [
    {
      key: "id",
      header: "ID",
    },
    {
      key: "usuario.nombreCompleto",
      header: "Nombre Completo",
    },
    {
      key: "usuario.username",
      header: "Usuario",
    },
    {
      key: "usuario.correo",
      header: "Correo",
    },
    {
      key: "especialidad",
      header: "Especialidad",
      render: (trabajador: TrabajadorResponse) => <Badge variant="secondary">{trabajador.especialidad}</Badge>,
    },
    {
      key: "taller.nombre",
      header: "Taller",
    },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (trabajador: TrabajadorResponse) => new Date(trabajador.fechaCreacion).toLocaleDateString(),
    },
  ]

  const actions = (trabajador: TrabajadorResponse) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedTrabajador(trabajador)
          setModalOpen(true)
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        disabled={true} 
        title="La eliminación de trabajadores está deshabilitada"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const handleApplyFilters = (filters: FilterParams) => {
    setCurrentFilters(filters)
    setCurrentPage(0)
    loadTrabajadores(0, pageSize, filters)
  }

  const handleClearFilters = () => {
    setCurrentFilters({})
    setCurrentPage(0)
    loadTrabajadores(0, pageSize, {})
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Trabajadores</h2>
            <p className="text-muted-foreground">Gestiona todos los trabajadores del sistema</p>
          </div>
          <div className="flex gap-2">
            <AdvancedFilters
              filters={[
                ...trabajadorFilters,
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
                setSelectedTrabajador(null)
                setModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Trabajador
            </Button>
          </div>
        </div>

        <DataTable
          data={trabajadores}
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
        />
      </div>
      <TrabajadorFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        trabajador={selectedTrabajador}
        onSuccess={() => loadTrabajadores(currentPage, pageSize, currentFilters)}
      />
    </AdminLayout>
  )
}
