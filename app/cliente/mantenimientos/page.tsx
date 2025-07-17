"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/admin/data-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Search, Eye, Car, Wrench, Calendar } from "lucide-react"
import { toast } from "sonner"
import { MantenimientoFormModal } from "@/components/cliente/mantenimiento-form-modal"
import { MantenimientoDetailsModal } from "@/components/cliente/mantenimiento-details-modal"
import { obtenerMisMantenimientos, obtenerMisVehiculosParaMantenimiento } from "@/lib/mantenimientos-cliente-api"
import type { MantenimientoResponseCliente, MantenimientoFiltersCliente } from "@/types/mantenimientos-cliente"
import type { VehiculoResponse } from "@/types/vehiculos"

const estadoColors = {
  SOLICITADO: "bg-blue-100 text-blue-800 border-blue-200",
  EN_PROCESO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  COMPLETADO: "bg-green-100 text-green-800 border-green-200",
  PENDIENTE: "bg-orange-100 text-orange-800 border-orange-200",
  CANCELADO: "bg-red-100 text-red-800 border-red-200",
}

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoResponseCliente[]>([])
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MantenimientoResponseCliente | null>(null)

  // Filtros y paginación
  const [filters, setFilters] = useState<MantenimientoFiltersCliente>({
    search: "",
    vehiculoId: undefined,
    estado: "",
    page: 0,
    size: 10,
    sort: "fechaCreacion,desc",
  })
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    cargarMantenimientos()
    cargarVehiculos()
  }, [filters])

  const cargarMantenimientos = async () => {
    setLoading(true)
    try {
      const response = await obtenerMisMantenimientos(filters)
      setMantenimientos(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      toast.error("Error al cargar mantenimientos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const cargarVehiculos = async () => {
    try {
      const data = await obtenerMisVehiculosParaMantenimiento()
      setVehiculos(data)
    } catch (error) {
      console.error("Error al cargar vehículos:", error)
    }
  }

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 0 }))
  }

  const handleVehiculoFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      vehiculoId: value === "all" ? undefined : Number.parseInt(value),
      page: 0,
    }))
  }

  const handleEstadoFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, estado: value, page: 0 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleVerDetalles = (mantenimiento: MantenimientoResponseCliente) => {
    setSelectedMantenimiento(mantenimiento)
    setShowDetailsModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Definición de columnas para DataTable
  const columns = [
    {
      key: "id",
      header: "ID",
      render: (m: MantenimientoResponseCliente) => (
        <span className="font-medium">#{m.id}</span>
      ),
    },
    {
      key: "vehiculo",
      header: "Vehículo",
      render: (m: MantenimientoResponseCliente) => (
        <div>
          <div className="font-medium">{m.vehiculo.placa}</div>
          <div className="text-sm text-muted-foreground">{m.vehiculo.marca} {m.vehiculo.modelo}</div>
        </div>
      ),
    },
    {
      key: "servicio",
      header: "Servicio",
      render: (m: MantenimientoResponseCliente) => m.servicio.nombre,
    },
    {
      key: "taller",
      header: "Taller",
      render: (m: MantenimientoResponseCliente) => m.servicio.taller.nombre,
    },
    {
      key: "estado",
      header: "Estado",
      render: (m: MantenimientoResponseCliente) => (
        <Badge className={estadoColors[m.estado]}>{m.estado.replace("_", " ")}</Badge>
      ),
    },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (m: MantenimientoResponseCliente) => formatDate(m.fechaCreacion),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (m: MantenimientoResponseCliente) => (
        <Button variant="ghost" size="sm" onClick={() => handleVerDetalles(m)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Mantenimientos</h1>
          <p className="text-muted-foreground">Gestiona y solicita mantenimientos para tus vehículos</p>
        </div>
        <Button onClick={() => setShowFormModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Solicitar Mantenimiento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">mantenimientos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitados</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mantenimientos.filter((m) => m.estado === "SOLICITADO").length}</div>
            <p className="text-xs text-muted-foreground">pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mantenimientos.filter((m) => m.estado === "EN_PROCESO").length}</div>
            <p className="text-xs text-muted-foreground">activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mantenimientos.filter((m) => m.estado === "COMPLETADO").length}</div>
            <p className="text-xs text-muted-foreground">finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra tus mantenimientos por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa, servicio..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filters.vehiculoId?.toString() || "all"} onValueChange={handleVehiculoFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Todos los vehículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vehículos</SelectItem>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                    {vehiculo.placa} - {vehiculo.marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.estado || "all"} onValueChange={handleEstadoFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="SOLICITADO">Solicitado</SelectItem>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de mantenimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Mantenimientos</CardTitle>
          <CardDescription>
            Mostrando {mantenimientos.length} de {totalElements} mantenimientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando mantenimientos...</div>
            </div>
          ) : mantenimientos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No hay mantenimientos</h3>
              <p className="text-muted-foreground mb-4">No tienes mantenimientos registrados aún.</p>
              <Button onClick={() => setShowFormModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Solicitar Primer Mantenimiento
              </Button>
            </div>
          ) : (
            <DataTable
              data={mantenimientos}
              columns={columns}
              totalPages={totalPages}
              currentPage={filters.page || 0}
              totalElements={totalElements}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              onPageSizeChange={(size) => setFilters((prev) => ({ ...prev, size, page: 0 }))}
              pageSize={filters.size}
              isLoading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <MantenimientoFormModal open={showFormModal} onOpenChange={setShowFormModal} onSuccess={cargarMantenimientos} />

      <MantenimientoDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        mantenimiento={selectedMantenimiento}
      />
    </div>
  )
}
