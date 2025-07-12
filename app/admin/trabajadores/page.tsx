"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { trabajadoresApi } from "@/lib/admin-api"
import type { TrabajadorResponse, PageResponse } from "@/types/admin"
import { toast } from "sonner"

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState<TrabajadorResponse[]>([])
  const [pagination, setPagination] = useState<PageResponse<TrabajadorResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const loadTrabajadores = async (page = 0, size = 10, search = "") => {
    try {
      setIsLoading(true)
      const response = await trabajadoresApi.filter({
        page,
        size,
        search,
        sort: "fechaCreacion,desc",
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
    loadTrabajadores(currentPage, pageSize)
  }, [currentPage, pageSize])

  const handleSearch = (search: string) => {
    setCurrentPage(0)
    loadTrabajadores(0, pageSize, search)
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
        loadTrabajadores(currentPage, pageSize)
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
          toast.info("Función de edición próximamente")
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleDelete(trabajador.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Trabajadores</h2>
            <p className="text-muted-foreground">Gestiona todos los trabajadores del sistema</p>
          </div>
          <Button onClick={() => toast.info("Función de creación próximamente")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Trabajador
          </Button>
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
    </AdminLayout>
  )
}
