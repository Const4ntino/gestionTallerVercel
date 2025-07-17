"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/admin/data-table"
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

  // Definición de columnas para DataTable
  const columns = [
    {
      key: "placa",
      header: "Placa",
      render: (vehiculo: VehiculoResponse) => vehiculo.placa,
    },
    {
      key: "marca",
      header: "Marca",
      render: (vehiculo: VehiculoResponse) => vehiculo.marca,
    },
    {
      key: "modelo",
      header: "Modelo",
      render: (vehiculo: VehiculoResponse) => vehiculo.modelo,
    },
    {
      key: "anio",
      header: "Año",
      render: (vehiculo: VehiculoResponse) => vehiculo.anio,
    },
    {
      key: "motor",
      header: "Motor",
      render: (vehiculo: VehiculoResponse) => vehiculo.motor || "-",
    },
    {
      key: "tipoVehiculo",
      header: "Tipo",
      render: (vehiculo: VehiculoResponse) => vehiculo.tipoVehiculo || "-",
    },
    {
      key: "estado",
      header: "Estado",
      render: (vehiculo: VehiculoResponse) => getEstadoBadge(vehiculo.estado),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (vehiculo: VehiculoResponse) => (
        <Button variant="ghost" size="sm" onClick={() => handleEditVehiculo(vehiculo)}>
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

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

          <DataTable
            data={vehiculos}
            columns={columns}
            totalPages={totalPages}
            currentPage={currentPage}
            totalElements={totalElements}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onPageSizeChange={(size) => setFilters((prev) => ({ ...prev, size, page: 0 }))}
            pageSize={filters.size}
            isLoading={isLoading}
          />

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
