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
import { UsuarioFormModal } from "@/components/admin/forms/usuario-form-modal"
import { AdvancedFilters } from "@/components/admin/advanced-filters"
import type { FilterParams } from "@/types/utils"
import { DetailsModal } from "@/components/admin/details-modal"
import { useAuth } from "@/contexts/auth-context"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [pagination, setPagination] = useState<PageResponse<UsuarioResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioResponse | null>(null)
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({})
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedUsuarioDetails, setSelectedUsuarioDetails] = useState<UsuarioResponse | null>(null)
  
  // Obtener el rol del usuario actual
  const { user } = useAuth()

  const userFilters = [
    { key: "search", label: "Búsqueda General", type: "text" as const },
    {
      key: "rol",
      label: "Rol",
      type: "select" as const,
      options: [
        { value: "ADMINISTRADOR", label: "Administrador" },
        { value: "ADMINISTRADOR_TALLER", label: "Administrador de Taller" },
        { value: "TRABAJADOR", label: "Trabajador" },
        { value: "CLIENTE", label: "Cliente" },
      ],
    },
    { key: "fechaCreacionDesde", label: "Fecha Creación Desde", type: "date" as const },
    { key: "fechaCreacionHasta", label: "Fecha Creación Hasta", type: "date" as const },
    { key: "fechaActualizacionDesde", label: "Fecha Actualización Desde", type: "date" as const },
    { key: "fechaActualizacionHasta", label: "Fecha Actualización Hasta", type: "date" as const },
  ]

  const loadUsuarios = async (page = 0, size = 10, filters: FilterParams = {}) => {
    try {
      setIsLoading(true)
      const response = await usuariosApi.filter({
        page,
        size,
        sort: "fechaCreacion,desc",
        ...filters,
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
    loadUsuarios(currentPage, pageSize, currentFilters)
  }, [currentPage, pageSize, currentFilters])

  const handleSearch = (search: string) => {
    const newFilters = { ...currentFilters, search }
    setCurrentFilters(newFilters)
    setCurrentPage(0)
    loadUsuarios(0, pageSize, newFilters)
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
        loadUsuarios(currentPage, pageSize, currentFilters)
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

  const actions = (usuario: UsuarioResponse) => {
    // Determinar si el botón de edición debe estar deshabilitado
    // Un ADMINISTRADOR_TALLER solo puede editar usuarios con rol CLIENTE
    const isAdminTaller = user?.rol === "ADMINISTRADOR_TALLER"
    const canEdit = !isAdminTaller || usuario.rol === "CLIENTE"
    
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canEdit}
          onClick={() => {
            if (canEdit) {
              setSelectedUsuario(usuario)
              setModalOpen(true)
            }
          }}
          title={!canEdit ? "No tienes permisos para editar este usuario" : "Editar usuario"}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={true} 
          title="La eliminación de usuarios está deshabilitada"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const handleApplyFilters = (filters: FilterParams) => {
    setCurrentFilters(filters)
    setCurrentPage(0)
    loadUsuarios(0, pageSize, filters)
  }

  const handleClearFilters = () => {
    setCurrentFilters({})
    setCurrentPage(0)
    loadUsuarios(0, pageSize, {})
  }

  const handleViewDetails = (usuario: UsuarioResponse) => {
    setSelectedUsuarioDetails(usuario)
    setDetailsModalOpen(true)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground">Gestiona todos los usuarios del sistema</p>
          </div>
          <div className="flex gap-2">
            <AdvancedFilters
              filters={userFilters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
            <Button
              onClick={() => {
                setSelectedUsuario(null)
                setModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>
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
          showDetails={true}
          onViewDetails={handleViewDetails}
        />
      </div>
      <UsuarioFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        usuario={selectedUsuario}
        onSuccess={() => loadUsuarios(currentPage, pageSize, currentFilters)}
      />
      <DetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        title="Detalles del Usuario"
        description="Información completa del usuario seleccionado"
        fields={
          selectedUsuarioDetails
            ? [
                { label: "ID", value: selectedUsuarioDetails.id },
                { label: "Nombre Completo", value: selectedUsuarioDetails.nombreCompleto },
                { label: "Usuario", value: selectedUsuarioDetails.username },
                { label: "Correo Electrónico", value: selectedUsuarioDetails.correo },
                {
                  label: "Rol",
                  value: selectedUsuarioDetails.rol,
                  type: "badge",
                  variant: getRoleBadgeVariant(selectedUsuarioDetails.rol),
                },
                { label: "Fecha de Creación", value: selectedUsuarioDetails.fechaCreacion, type: "date" },
                { label: "Última Actualización", value: selectedUsuarioDetails.fechaActualizacion, type: "date" },
              ]
            : []
        }
      />
    </AdminLayout>
  )
}
