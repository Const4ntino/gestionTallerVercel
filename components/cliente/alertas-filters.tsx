"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, RotateCcw } from "lucide-react"
import type { AlertaFilters } from "@/types/alertas-cliente"
import { vehiculosApi } from "@/lib/vehiculos-api"

interface AlertasFiltersProps {
  filters: AlertaFilters
  onFiltersChange: (filters: AlertaFilters) => void
  onApplyFilters: () => void
  isLoading?: boolean
}

interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
}

const tiposAlerta = [
  { value: "MANTENIMIENTO_PREVENTIVO", label: "Mantenimiento Preventivo" },
  { value: "FALLA_MECANICA", label: "Falla Mecánica" },
  { value: "STOCK_BAJO", label: "Stock Bajo" },
  { value: "VEHICULO_LISTO", label: "Vehículo Listo" },
  { value: "NUEVA_SOLICITUD", label: "Nueva Solicitud" },
]

const estadosAlerta = [
  { value: "NUEVA", label: "Nuevas" },
  { value: "VISTA", label: "Vistas" },
]

export function AlertasFilters({ filters, onFiltersChange, onApplyFilters, isLoading }: AlertasFiltersProps) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loadingVehiculos, setLoadingVehiculos] = useState(false)

  useEffect(() => {
    cargarVehiculos()
  }, [])

  const cargarVehiculos = async () => {
    try {
      setLoadingVehiculos(true)
      const response = await vehiculosApi.obtenerMisVehiculos({ page: 0, size: 100 })
      setVehiculos(response.content)
    } catch (error) {
      console.error("Error al cargar vehículos:", error)
    } finally {
      setLoadingVehiculos(false)
    }
  }

  const handleFilterChange = (key: keyof AlertaFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      page: 0,
      size: 10,
      estado: "NUEVA", // Por defecto mostrar solo nuevas
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar en mensajes..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Vehículo */}
          <div className="space-y-2">
            <Label>Vehículo</Label>
            <Select
              value={filters.vehiculoId?.toString() || "all"}
              onValueChange={(value) =>
                handleFilterChange("vehiculoId", value === "all" ? undefined : Number.parseInt(value))
              }
              disabled={loadingVehiculos}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los vehículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vehículos</SelectItem>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Alerta</Label>
            <Select
              value={filters.tipo || "all"}
              onValueChange={(value) => handleFilterChange("tipo", value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tiposAlerta.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={filters.estado || "all"}
              onValueChange={(value) => handleFilterChange("estado", value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {estadosAlerta.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={onApplyFilters} disabled={isLoading} className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={handleClearFilters} disabled={isLoading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
