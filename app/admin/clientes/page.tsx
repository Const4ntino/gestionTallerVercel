"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Phone, MapPin } from "lucide-react"
import { clientesApi } from "@/lib/admin-api"
import type { ClienteResponse, PageResponse } from "@/types/admin"
import { toast } from "sonner"
import { ClienteFormModal } from "@/components/admin/forms/cliente-form-modal"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteResponse[]>([])
  const [pagination, setPagination] = useState<PageResponse<ClienteResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteResponse | null>(null)

  const loadClientes = async (page = 0, size = 10, search = "") => {
    try {
      setIsLoading(true)
      const response = await clientesApi.filter({
        page,
        size,
        search,
        sort: "fechaCreacion,desc",
      })
      setPagination(response)
      setClientes(response.content)
    } catch (error) {
      toast.error("Error al cargar clientes")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClientes(currentPage, pageSize)
  }, [currentPage, pageSize])

  const handleSearch = (search: string) => {
    setCurrentPage(0)
    loadClientes(0, pageSize, search)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await clientesApi.delete(id)
        toast.success("Cliente eliminado correctamente")
        loadClientes(currentPage, pageSize)
      } catch (error) {
        toast.error("Error al eliminar cliente")
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
      key: "telefono",
      header: "Teléfono",
      render: (cliente: ClienteResponse) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {cliente.telefono}
        </div>
      ),
    },
    {
      key: "direccion",
      header: "Dirección",
      render: (cliente: ClienteResponse) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[200px]" title={cliente.direccion}>
            {cliente.direccion}
          </span>
        </div>
      ),
    },
    {
      key: "tallerAsignado.nombre",
      header: "Taller Asignado",
    },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (cliente: ClienteResponse) => new Date(cliente.fechaCreacion).toLocaleDateString(),
    },
  ]

  const actions = (cliente: ClienteResponse) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedCliente(cliente)
          setModalOpen(true)
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleDelete(cliente.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-muted-foreground">Gestiona todos los clientes del sistema</p>
          </div>
          <Button
            onClick={() => {
              setSelectedCliente(null)
              setModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>

        <DataTable
          data={clientes}
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
      <ClienteFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cliente={selectedCliente}
        onSuccess={() => loadClientes(currentPage, pageSize)}
      />
    </AdminLayout>
  )
}
