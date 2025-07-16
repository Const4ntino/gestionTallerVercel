"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, MoreHorizontal, Eye, FileText } from "lucide-react"
import { toast } from "sonner"
import { obtenerMisMantenimientos, obtenerMisVehiculosParaMantenimiento } from "@/lib/mantenimientos-cliente-api"
import { MantenimientoFormModal } from "@/components/cliente/mantenimiento-form-modal"
import { MantenimientoDetailsModal } from "@/components/cliente/mantenimiento-details-modal"
import type { MantenimientoResponseCliente, MantenimientoFiltersCliente } from "@/types/mantenimientos-cliente"
import type { VehiculoResponse } from "@/types/vehiculos"

export default function MisMantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoResponseCliente[]>([])
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [filters, setFilters] = useState<MantenimientoFiltersCliente>({
    search: "",
    vehiculoId: undefined,
    estado: "",
    page: 0,
    size: 10,
    sort: "fechaCreacion,desc",
  })
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedMantenimientoId, setSelectedMantenimientoId] = useState<number | null>(null)

  const cargarMantenimientos = async () => {
    setIsLoading(true)
    try {
      const response = await obtenerMisMantenimientos(filters)
      setMantenimientos(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
      setCurrentPage(response.number)
    } catch (error) {
      toast.error("Error al cargar los mantenimientos")
      console.error(error)
    } finally {
      setIsLoading(false)
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

  useEffect(() => {
    cargarMantenimientos()
  }, [filters])

  useEffect(() => {
    cargarVehiculos()
  }, [])

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 0 }))
  }

  const handleVehiculoChange = (vehiculoId: string) => {
    setFilters((prev) => ({
      ...prev,
      vehiculoId: vehiculoId === "all" ? undefined : Number.parseInt(vehiculoId),
      page: 0,
    }))
  }

  const handleEstadoChange = (estado: string) => {
    setFilters((prev) => ({ ...prev, estado: estado === "all" ? "" : estado, page: 0 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleCreateMantenimiento = () => {
    setIsFormModalOpen(true)
  }

  const handleViewDetails = (mantenimientoId: number) => {
    setSelectedMantenimientoId(mantenimientoId)
    setIsDetailsModalOpen(true)
  }

  const handleFormSuccess = () => {
    cargarMantenimientos()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "SOLICITADO":
        return <Badge variant="secondary">Solicitado</Badge>
      case "PENDIENTE":
        return <Badge variant="outline">Pendiente</Badge>
      case "EN_PROCESO":
        return (
          <Badge variant="default" className="bg-blue-500">
            En Proceso
          </Badge>
        )
      case "COMPLETADO":
        return (
          <Badge variant="default" className="bg-green-500">
            Completado
          </Badge>
        )
      case "CANCELADO":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Mantenimientos</h1>
          <p className="text-muted-foreground">Gestiona las solicitudes de mantenimiento de tus vehículos</p>
        </div>
        <Button onClick={handleCreateMantenimiento}>
          <Plus className="mr-2 h-4 w-4" />
          Solicitar Mantenimiento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Mantenimientos
          </CardTitle>
          <CardDescription>
            {totalElements > 0
              ? `Mostrando ${mantenimientos.length} de ${totalElements} mantenimientos`
              : "No tienes mantenimientos registrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, servicio u observaciones..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filters.vehiculoId?.toString() || "all"} onValueChange={handleVehiculoChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por vehículo" />
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
            <Select value={filters.estado || "all"} onValueChange={handleEstadoChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="SOLICITADO">Solicitado</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : mantenimientos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay mantenimientos</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.estado || filters.vehiculoId
                  ? "No se encontraron mantenimientos con los filtros aplicados."
                  : "Comienza solicitando tu primer mantenimiento."}
              </p>
              {!filters.search && !filters.estado && !filters.vehiculoId && (
                <Button onClick={handleCreateMantenimiento} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Solicitar Primer Mantenimiento
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Trabajador</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Solicitud</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead className="w-[70px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mantenimientos.map((mantenimiento) => (
                      <TableRow key={mantenimiento.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{mantenimiento.vehiculo.placa}</p>
                            <p className="text-sm text-muted-foreground">
                              {mantenimiento.vehiculo.marca} {mantenimiento.vehiculo.modelo}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{mantenimiento.servicio.nombre}</TableCell>
                        <TableCell>
                          {mantenimiento.trabajador ? mantenimiento.trabajador.usuario.nombreCompleto : "No asignado"}
                        </TableCell>
                        <TableCell>{getEstadoBadge(mantenimiento.estado)}</TableCell>
                        <TableCell>{formatDate(mantenimiento.fechaCreacion)}</TableCell>
                        <TableCell>
                          {mantenimiento.fechaInicio ? formatDate(mantenimiento.fechaInicio) : "No definida"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(mantenimiento.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage + 1} de {totalPages}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <MantenimientoFormModal open={isFormModalOpen} onOpenChange={setIsFormModalOpen} onSuccess={handleFormSuccess} />

      <MantenimientoDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        mantenimientoId={selectedMantenimientoId}
      />
    </div>
  )
}
