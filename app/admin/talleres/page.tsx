"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"
import { talleresApi } from "@/lib/admin-api"
import type { TallerResponse, PageResponse } from "@/types/admin"
import { toast } from "sonner"

export default function TalleresPage() {
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [pagination, setPagination] = useState<PageResponse<TallerResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const loadTalleres = async (page = 0, size = 10, search = "") => {
    try {
      setIsLoading(true)
      const response = await talleresApi.filter({
        page,
        size,
        search,
        sort: "nombre,asc",
      })
      setPagination(response)
      setTalleres(response.content)
    } catch (error) {
      toast.error("Error al cargar talleres")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTalleres(currentPage, pageSize)
  }, [currentPage, pageSize])

  const handleSearch = (search: string) => {
    setCurrentPage(0)
    loadTalleres(0, pageSize, search)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este taller?")) {
      try {
        await talleresApi.delete(id)
        toast.success("Taller eliminado correctamente")
        loadTalleres(currentPage, pageSize)
      } catch (error) {
        toast.error("Error al eliminar taller")
        console.error(error)
      }
    }
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return "default"
      case "SUSPENDIDO":
        return "destructive"
      case "INACTIVO":
        return "secondary"
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
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "ciudad",
      header: "Ciudad",
    },
    {
      key: "direccion",
      header: "Dirección",
      render: (taller: TallerResponse) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[200px]" title={taller.direccion}>
            {taller.direccion}
          </span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (taller: TallerResponse) => <Badge variant={getEstadoBadgeVariant(taller.estado)}>{taller.estado}</Badge>,
    },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (taller: TallerResponse) => new Date(taller.fechaCreacion).toLocaleDateString(),
    },
  ]

  const actions = (taller: TallerResponse) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          toast.info("Función de edición próximamente")
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleDelete(taller.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Talleres</h2>
            <p className="text-muted-foreground">Gestiona todos los talleres del sistema</p>
          </div>
          <Button onClick={() => toast.info("Función de creación próximamente")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Taller
          </Button>
        </div>

        <DataTable
          data={talleres}
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
    </AdminLayout>
  )
}
