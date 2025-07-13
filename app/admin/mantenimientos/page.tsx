"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Eye, Edit, Trash2 } from "lucide-react"
import { mantenimientosApi } from "@/lib/mantenimientos-api"
import type { MantenimientoResponse, MantenimientoFilterParams } from "@/types/mantenimientos"
import { toast } from "sonner"
import { MantenimientoFormModal } from "@/components/admin/forms/mantenimiento-form-modal"
import { DataTable } from "@/components/admin/data-table"
import { MantenimientosDashboard } from "@/components/admin/mantenimientos/mantenimientos-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailsModal } from "@/components/admin/details-modal"
import { formatDateTime } from "@/lib/utils" // Importar la utilidad de formato de fecha

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MantenimientoResponse | undefined>(undefined)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [detailsData, setDetailsData] = useState<any>(null)

  useEffect(() => {
    loadMantenimientos()
  }, [])

  const loadMantenimientos = async (filters?: MantenimientoFilterParams) => {
    try {
      setIsLoading(true)
      const data = await mantenimientosApi.getAll(filters)
      setMantenimientos(data)
    } catch (error) {
      toast.error("Error al cargar mantenimientos")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedMantenimiento(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (mantenimiento: MantenimientoResponse) => {
    setSelectedMantenimiento({
      id: mantenimiento.id,
      vehiculoId: mantenimiento.vehiculo.id,
      servicioId: mantenimiento.servicio.id,
      trabajadorId: mantenimiento.trabajador?.id || null,
      estado: mantenimiento.estado,
      observacionesCliente: mantenimiento.observacionesCliente,
      observacionesTrabajador: mantenimiento.observacionesTrabajador,
      productosUsados: mantenimiento.productosUsados.map((p) => ({
        productoId: p.producto.id,
        cantidadUsada: p.cantidadUsada,
        precioEnUso: p.precioEnUso,
      })),
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este mantenimiento?")) {
      try {
        await mantenimientosApi.remove(id)
        toast.success("Mantenimiento eliminado exitosamente")
        loadMantenimientos()
      } catch (error) {
        toast.error("Error al eliminar mantenimiento")
        console.error(error)
      }
    }
  }

  const handleViewDetails = (mantenimiento: MantenimientoResponse) => {
    setDetailsData({
      ID: mantenimiento.id,
      Vehículo: `${mantenimiento.vehiculo.placa} - ${mantenimiento.vehiculo.marca} ${mantenimiento.vehiculo.modelo}`,
      Cliente: mantenimiento.vehiculo.cliente.usuario.nombreCompleto,
      Servicio: `${mantenimiento.servicio.nombre} (${mantenimiento.servicio.taller.nombre})`,
      Trabajador: mantenimiento.trabajador ? mantenimiento.trabajador.usuario.nombreCompleto : "N/A",
      Estado: { value: mantenimiento.estado, type: "badge", variant: getEstadoBadgeVariant(mantenimiento.estado) },
      "Fecha de Inicio": formatDateTime(mantenimiento.fechaInicio),
      "Fecha de Fin": formatDateTime(mantenimiento.fechaFin),
      "Observaciones del Cliente": mantenimiento.observacionesCliente || "N/A",
      "Observaciones del Trabajador": mantenimiento.observacionesTrabajador || "N/A",
      "Productos Usados":
        mantenimiento.productosUsados.length > 0
          ? mantenimiento.productosUsados
              .map((p) => `${p.producto.nombre} (x${p.cantidadUsada}) - $${p.precioEnUso.toFixed(2)}`)
              .join(", ")
          : "Ninguno",
      "Fecha de Creación": formatDateTime(mantenimiento.fechaCreacion),
      "Última Actualización": formatDateTime(mantenimiento.fechaActualizacion),
    })
    setIsDetailsModalOpen(true)
  }

  const getEstadoBadgeVariant = (estado: MantenimientoResponse["estado"]) => {
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
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "vehiculo.placa",
      header: "Vehículo",
      cell: ({ row }: { row: any }) => (
        <span>
          {row.original.vehiculo.placa} <br />
          <span className="text-muted-foreground text-xs">
            {row.original.vehiculo.marca} {row.original.vehiculo.modelo}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "servicio.nombre",
      header: "Servicio",
      cell: ({ row }: { row: any }) => (
        <span>
          {row.original.servicio.nombre} <br />
          <span className="text-muted-foreground text-xs">({row.original.servicio.taller.nombre})</span>
        </span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }: { row: any }) => (
        <Badge variant={getEstadoBadgeVariant(row.original.estado)}>{row.original.estado.replace(/_/g, " ")}</Badge>
      ),
    },
    {
      accessorKey: "trabajador.usuario.nombreCompleto",
      header: "Trabajador",
      cell: ({ row }: { row: any }) => <span>{row.original.trabajador?.usuario.nombreCompleto || "Sin asignar"}</span>,
    },
    {
      accessorKey: "fechaCreacion",
      header: "Fecha Creación",
      cell: ({ row }: { row: any }) => formatDateTime(row.original.fechaCreacion),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleViewDetails(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Mantenimientos</h1>
      <p className="text-muted-foreground">Panel integral para la gestión de mantenimientos vehiculares</p>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard en Vivo</TabsTrigger>
          <TabsTrigger value="listado">Listado Detallado</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <MantenimientosDashboard onRefresh={loadMantenimientos} />
        </TabsContent>
        <TabsContent value="listado" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Todos los Mantenimientos</h2>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Mantenimiento
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={mantenimientos}
            isLoading={isLoading}
            filterPlaceholder="Buscar por vehículo o servicio..."
            filterColumn="vehiculo.placa" // Opcional: columna para el filtro de búsqueda
            onSearch={(searchValue) => loadMantenimientos({ search: searchValue })}
            showAdvancedFilters={true}
            onAdvancedFilter={(filters) => loadMantenimientos(filters)}
            showDetails={true}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      <MantenimientoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadMantenimientos()
          setIsModalOpen(false)
        }}
        mantenimiento={selectedMantenimiento}
      />

      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalles del Mantenimiento"
        data={detailsData}
      />
    </div>
  )
}
