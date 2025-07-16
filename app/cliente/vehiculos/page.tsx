"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/admin/data-table"
import { VehiculoFormModal } from "@/components/cliente/vehiculo-form-modal"
import { vehiculosApi } from "@/lib/vehiculos-api"
import type { VehiculoResponse, VehiculoFilterParams } from "@/types/vehiculos"
import { Plus, Car, Search, Filter } from "lucide-react"
import { toast } from "sonner"

export default function MisVehiculosPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [isLoadingVehiculos, setIsLoadingVehiculos] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingVehiculo, setEditingVehiculo] = useState<VehiculoResponse | null>(null)
  const [filters, setFilters] = useState<VehiculoFilterParams>({
    page: 0,
    size: 10,
    sort: "fechaCreacion,desc",
    estado: "ALL", // Updated default value to "ALL"
  })
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && user.rol !== "CLIENTE") {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.rol === "CLIENTE") {
      loadVehiculos()
    }
  }, [user, filters])

  const loadVehiculos = async () => {
    try {
      setIsLoadingVehiculos(true)
      const response = await vehiculosApi.getMisVehiculos(filters)
      setVehiculos(response.content)
      setPagination({
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        currentPage: response.number,
      })
    } catch (error) {
      console.error("Error al cargar vehículos:", error)
      toast.error("Error al cargar los vehículos")
    } finally {
      setIsLoadingVehiculos(false)
    }
  }

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 0 }))
  }

  const handleFilterChange = (key: keyof VehiculoFilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, size, page: 0 }))
  }

  const handleCreateVehiculo = () => {
    setEditingVehiculo(null)
    setShowFormModal(true)
  }

  const handleEditVehiculo = (vehiculo: VehiculoResponse) => {
    setEditingVehiculo(vehiculo)
    setShowFormModal(true)
  }

  const handleFormSuccess = () => {
    loadVehiculos()
    setShowFormModal(false)
    setEditingVehiculo(null)
  }

  const columns = [
    {
      key: "placa",
      header: "Placa",
      render: (vehiculo: VehiculoResponse) => <div className="font-medium">{vehiculo.placa}</div>,
    },
    {
      key: "marca",
      header: "Marca",
    },
    {
      key: "modelo",
      header: "Modelo",
    },
    {
      key: "anio",
      header: "Año",
    },
    {
      key: "tipoVehiculo",
      header: "Tipo",
    },
    {
      key: "estado",
      header: "Estado",
      render: (vehiculo: VehiculoResponse) => {
        const estadoColors = {
          ACTIVO: "bg-green-100 text-green-800",
          INACTIVO: "bg-gray-100 text-gray-800",
          EN_MANTENIMIENTO: "bg-yellow-100 text-yellow-800",
        }
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[vehiculo.estado as keyof typeof estadoColors] || "bg-gray-100 text-gray-800"}`}
          >
            {vehiculo.estado.replace("_", " ")}
          </span>
        )
      },
    },
  ]

  const actions = (vehiculo: VehiculoResponse) => (
    <Button variant="outline" size="sm" onClick={() => handleEditVehiculo(vehiculo)}>
      Editar
    </Button>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.rol !== "CLIENTE") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Car className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Vehículos</h1>
          </div>
          <p className="text-gray-600">Gestiona tus vehículos registrados</p>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Lista de Vehículos</CardTitle>
                <CardDescription>Aquí puedes ver y gestionar todos tus vehículos registrados</CardDescription>
              </div>
              <Button onClick={handleCreateVehiculo} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Registrar Nuevo Vehículo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por placa, marca o modelo..."
                    className="pl-8"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={filters.estado || "ALL"}
                  onValueChange={(value) => handleFilterChange("estado", value || "ALL")}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
                    <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <DataTable
              data={vehiculos}
              columns={columns}
              totalPages={pagination.totalPages}
              currentPage={pagination.currentPage}
              totalElements={pagination.totalElements}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSize={filters.size || 10}
              isLoading={isLoadingVehiculos}
              actions={actions}
            />
          </CardContent>
        </Card>

        {/* Form Modal */}
        <VehiculoFormModal
          open={showFormModal}
          onOpenChange={setShowFormModal}
          vehiculo={editingVehiculo}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  )
}
