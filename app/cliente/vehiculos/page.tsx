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
import { Plus, Search, MoreHorizontal, Edit, Car } from "lucide-react"
import { toast } from "sonner"
import { obtenerMisVehiculos } from "@/lib/vehiculos-api"
import { VehiculoFormModal } from "@/components/cliente/vehiculo-form-modal"
import type { VehiculoResponse, VehiculoFilters } from "@/types/vehiculos"

export default function MisVehiculosPage() {
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [filters, setFilters] = useState<VehiculoFilters>({
    search: "",
    estado: "",
    page: 0,
    size: 10,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehiculo, setSelectedVehiculo] = useState<VehiculoResponse | null>(null)

  const cargarVehiculos = async () => {
    setIsLoading(true)
    try {
      const response = await obtenerMisVehiculos(filters)
      setVehiculos(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
      setCurrentPage(response.number)
    } catch (error) {
      toast.error("Error al cargar los vehículos")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarVehiculos()
  }, [filters])

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 0 }))
  }

  const handleEstadoChange = (estado: string) => {
    setFilters((prev) => ({ ...prev, estado: estado === "all" ? "" : estado, page: 0 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleCreateVehiculo = () => {
    setSelectedVehiculo(null)
    setIsModalOpen(true)
  }

  const handleEditVehiculo = (vehiculo: VehiculoResponse) => {
    setSelectedVehiculo(vehiculo)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    cargarVehiculos()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return (
          <Badge variant="default" className="bg-green-500">
            Activo
          </Badge>
        )
      case "INACTIVO":
        return <Badge variant="secondary">Inactivo</Badge>
      case "EN_MANTENIMIENTO":
        return <Badge variant="destructive">En Mantenimiento</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Vehículos</h1>
          <p className="text-muted-foreground">Gestiona tus vehículos registrados en el taller</p>
        </div>
        <Button onClick={handleCreateVehiculo}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Vehículo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Lista de Vehículos
          </CardTitle>
          <CardDescription>
            {totalElements > 0
              ? `Mostrando ${vehiculos.length} de ${totalElements} vehículos`
              : "No tienes vehículos registrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, marca o modelo..."
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filters.estado || "all"} onValueChange={handleEstadoChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
                <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : vehiculos.length === 0 ? (
            <div className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay vehículos</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.estado
                  ? "No se encontraron vehículos con los filtros aplicados."
                  : "Comienza registrando tu primer vehículo."}
              </p>
              {!filters.search && !filters.estado && (
                <Button onClick={handleCreateVehiculo} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Primer Vehículo
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Motor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-[70px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiculos.map((vehiculo) => (
                      <TableRow key={vehiculo.id}>
                        <TableCell className="font-medium">{vehiculo.placa}</TableCell>
                        <TableCell>{vehiculo.marca || "-"}</TableCell>
                        <TableCell>{vehiculo.modelo || "-"}</TableCell>
                        <TableCell>{vehiculo.anio || "-"}</TableCell>
                        <TableCell>{vehiculo.motor || "-"}</TableCell>
                        <TableCell>{vehiculo.tipoVehiculo || "-"}</TableCell>
                        <TableCell>{getEstadoBadge(vehiculo.estado)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditVehiculo(vehiculo)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
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

      <VehiculoFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        vehiculo={selectedVehiculo}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
