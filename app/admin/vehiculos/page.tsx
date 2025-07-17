"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/admin/data-table"
import { VehiculoFormModal } from "@/components/admin/forms/vehiculo-form-modal"
import { Plus, Filter, MoreHorizontal, Edit, Trash2, ChevronDown, Calendar } from "lucide-react"
import { toast } from "sonner"
import { vehiculosAdminApi } from "@/lib/vehiculos-admin-api"
import { talleresApi } from "@/lib/admin-api"
import type { VehiculoResponse, VehiculoFilterParams } from "@/types/vehiculos-admin"
import type { TallerResponse } from "@/types/admin"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function VehiculosAdminPage() {
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedVehiculo, setSelectedVehiculo] = useState<VehiculoResponse | null>(null)

  // Delete confirmation state
  const [vehiculoToDelete, setVehiculoToDelete] = useState<VehiculoResponse | null>(null)

  // Filters state
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<VehiculoFilterParams>({
    search: "",
    estado: "",
    tallerAsignadoId: undefined,
    fechaCreacionDesde: "",
    fechaCreacionHasta: "",
  })

  // Load initial data
  useEffect(() => {
    loadVehiculos()
    loadTalleres()
  }, [currentPage, pageSize])

  // Load vehicles with current filters
  const loadVehiculos = async () => {
    setIsLoading(true)
    try {
      const params: VehiculoFilterParams = {
        ...filters,
        page: currentPage,
        size: pageSize,
        sort: "fechaCreacion,desc",
      }

      // Clean empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key as keyof VehiculoFilterParams] === "" ||
          params[key as keyof VehiculoFilterParams] === undefined
        ) {
          delete params[key as keyof VehiculoFilterParams]
        }
      })

      const response = await vehiculosAdminApi.filter(params)
      setVehiculos(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Error loading vehiculos:", error)
      toast.error("Error al cargar vehículos")
    } finally {
      setIsLoading(false)
    }
  }

  // Load talleres for filter
  const loadTalleres = async () => {
    try {
      const response = await talleresApi.getAll()
      setTalleres(response)
    } catch (error) {
      console.error("Error loading talleres:", error)
    }
  }

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(0)
    loadVehiculos()
  }

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      estado: "",
      tallerAsignadoId: undefined,
      fechaCreacionDesde: "",
      fechaCreacionHasta: "",
    })
    setCurrentPage(0)
    setTimeout(loadVehiculos, 100)
  }

  // Handle search
  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setCurrentPage(0)
    setTimeout(loadVehiculos, 100)
  }

  // Handle create/edit
  const handleCreateEdit = (vehiculo?: VehiculoResponse) => {
    setSelectedVehiculo(vehiculo || null)
    setIsFormModalOpen(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!vehiculoToDelete) return

    try {
      await vehiculosAdminApi.delete(vehiculoToDelete.id)
      toast.success("Vehículo eliminado exitosamente")
      loadVehiculos()
    } catch (error) {
      console.error("Error deleting vehiculo:", error)
      toast.error("Error al eliminar vehículo")
    } finally {
      setVehiculoToDelete(null)
    }
  }

  // Table columns
  const columns = [
    {
      key: "placa",
      header: "Placa",
      render: (vehiculo: VehiculoResponse) => <div className="font-medium">{vehiculo.placa}</div>,
    },
    {
      key: "marca",
      header: "Marca/Modelo",
      render: (vehiculo: VehiculoResponse) => (
        <div>
          <div className="font-medium">{vehiculo.marca}</div>
          <div className="text-sm text-muted-foreground">{vehiculo.modelo}</div>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (vehiculo: VehiculoResponse) => (
        <div>
          <div className="font-medium">{vehiculo.cliente.usuario.nombreCompleto}</div>
          <div className="text-sm text-muted-foreground">{vehiculo.cliente.tallerAsignado?.nombre || "Sin taller"}</div>
        </div>
      ),
    },
    {
      key: "detalles",
      header: "Detalles",
      render: (vehiculo: VehiculoResponse) => (
        <div className="text-sm">
          <div>Año: {vehiculo.anio}</div>
          <div>Motor: {vehiculo.motor}</div>
          <div>Tipo: {vehiculo.tipoVehiculo}</div>
        </div>
      ),
    },
    {
      key: "fechaCreacion",
      header: "Fecha de creación",
      render: (vehiculo: VehiculoResponse) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {new Date(vehiculo.fechaCreacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (vehiculo: VehiculoResponse) => (
        <Badge
          variant={
            vehiculo.estado === "ACTIVO"
              ? "default"
              : vehiculo.estado === "EN_MANTENIMIENTO"
                ? "secondary"
                : "destructive"
          }
        >
          {vehiculo.estado === "ACTIVO"
            ? "Activo"
            : vehiculo.estado === "EN_MANTENIMIENTO"
              ? "En Mantenimiento"
              : "Inactivo"}
        </Badge>
      ),
    },
  ]

  // Table actions
  const renderActions = (vehiculo: VehiculoResponse) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleCreateEdit(vehiculo)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setVehiculoToDelete(vehiculo)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Vehículos</h1>
            <p className="text-muted-foreground">Administra todos los vehículos del sistema</p>
          </div>
          <Button onClick={() => handleCreateEdit()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Vehículo
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros Avanzados
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Estado */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select
                      value={filters.estado}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, estado: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="ACTIVO">Activo</SelectItem>
                        <SelectItem value="INACTIVO">Inactivo</SelectItem>
                        <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Taller */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taller</label>
                    <Select
                      value={filters.tallerAsignadoId?.toString() || "all"}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          tallerAsignadoId: value === "all" ? undefined : Number.parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los talleres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {talleres.map((taller) => (
                          <SelectItem key={taller.id} value={taller.id.toString()}>
                            {taller.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fecha Desde */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha Desde</label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={filters.fechaCreacionDesde}
                        onChange={(e) => setFilters((prev) => ({ ...prev, fechaCreacionDesde: e.target.value }))}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Fecha Hasta */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha Hasta</label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={filters.fechaCreacionHasta}
                        onChange={(e) => setFilters((prev) => ({ ...prev, fechaCreacionHasta: e.target.value }))}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Data Table */}
        <DataTable
          data={vehiculos}
          columns={columns}
          totalPages={totalPages}
          currentPage={currentPage}
          totalElements={totalElements}
          onPageChange={setCurrentPage}
          onSearch={handleSearch}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          isLoading={isLoading}
          actions={renderActions}
        />

        {/* Form Modal */}
        <VehiculoFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false)
            setSelectedVehiculo(null)
          }}
          onSuccess={loadVehiculos}
          vehiculo={selectedVehiculo}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!vehiculoToDelete} onOpenChange={() => setVehiculoToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el vehículo{" "}
                <strong>{vehiculoToDelete?.placa}</strong> del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
