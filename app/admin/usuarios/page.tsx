"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { usuariosApi } from "@/lib/admin-api"
import type { UsuarioResponse, PageResponse } from "@/types/admin"
import { toast } from "sonner"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [pagination, setPagination] = useState<PageResponse<UsuarioResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const loadUsuarios = async (page = 0, size = 10, search = "") => {
    try {
      setIsLoading(true)
      const response = await usuariosApi.filter({
        page,
        size,
        search,
        sort: "fechaCreacion,desc",
      })
      setPagination(response)
      setUsuarios(response.content)
    } catch (error) {
      toast.error("Error al cargar usuarios")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsuarios(currentPage, pageSize)
  }, [currentPage, pageSize])

  const handleSearch = (search: string) => {
    setCurrentPage(0)
    loadUsuarios(0, pageSize, search)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await usuariosApi.delete(id)
        toast.success("Usuario eliminado correctamente")
        loadUsuarios(currentPage, pageSize)
      } catch (error) {
        toast.error("Error al eliminar usuario")
        console.error(error)
      }
    }
  }

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return "destructive"
      case "ADMINISTRADOR_TALLER":
        return "default"
      case "TRABAJADOR":
        return "secondary"
      case "CLIENTE":
        return "outline"
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
      key: "nombreCompleto",
      header: "Nombre Completo",
    },
    {
      key: "username",
      header: "Usuario",
    },
    {
      key: "correo",
      header: "Correo",
    },
    {
      key: "rol",
      header: "Rol",
      render: (usuario: UsuarioResponse) => <Badge variant={getRoleBadgeVariant(usuario.rol)}>{usuario.rol}</Badge>,
    },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (usuario: UsuarioResponse) => new Date(usuario.fechaCreacion).toLocaleDateString(),
    },
  ]

  const actions = (usuario: UsuarioResponse) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          // TODO: Implementar edición
          toast.info("Función de edición próximamente")
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleDelete(usuario.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground">Gestiona todos los usuarios del sistema</p>
          </div>
          <Button onClick={() => toast.info("Función de creación próximamente")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        <DataTable
          data={usuarios}
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
