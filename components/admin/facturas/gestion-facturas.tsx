"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import { AdvancedFilters } from "@/components/admin/advanced-filters"
import { DataTable } from "@/components/admin/data-table"
import { DetailsModal } from "@/components/admin/details-modal"
import type { FacturaResponse, FacturaFilterParams } from "@/types/facturas"
import type { PageResponse } from "@/types/admin"
import { Search, FileText, Eye, Download, Trash2 } from "lucide-react"

export function GestionFacturas() {
  const [facturas, setFacturas] = useState<FacturaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FacturaFilterParams>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFactura, setSelectedFactura] = useState<FacturaResponse | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const loadFacturas = async () => {
    try {
      setLoading(true)

      const hasFilters =
        Object.keys(filters).some(
          (key) =>
            filters[key as keyof FacturaFilterParams] !== undefined && filters[key as keyof FacturaFilterParams] !== "",
        ) || searchTerm.trim() !== ""

      if (hasFilters) {
        const filterParams: FacturaFilterParams = {
          ...filters,
          search: searchTerm.trim() || undefined,
          page,
          size,
        }

        const response: PageResponse<FacturaResponse> = await facturasApi.filter(filterParams)
        setFacturas(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } else {
        const response = await facturasApi.getAll()
        setFacturas(response)
        // Simular paginación para getAll
        const startIndex = page * size
        const endIndex = startIndex + size
        const paginatedData = response.slice(startIndex, endIndex)
        setFacturas(paginatedData)
        setTotalPages(Math.ceil(response.length / size))
        setTotalElements(response.length)
      }
    } catch (error) {
      console.error("Error al cargar facturas:", error)
      toast.error("Error al cargar las facturas")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta factura?")) {
      return
    }

    try {
      await facturasApi.delete(id)
      toast.success("Factura eliminada exitosamente")
      loadFacturas()
    } catch (error) {
      console.error("Error al eliminar factura:", error)
      toast.error("Error al eliminar la factura")
    }
  }

  const handleViewDetails = async (factura: FacturaResponse) => {
    try {
      const detailedFactura = await facturasApi.getDetails(factura.id)
      setSelectedFactura(detailedFactura)
      setShowDetails(true)
    } catch (error) {
      console.error("Error al obtener detalles:", error)
      toast.error("Error al obtener los detalles de la factura")
    }
  }

  const handleSearch = () => {
    setPage(0)
    loadFacturas()
  }

  const handleFilterChange = (newFilters: FacturaFilterParams) => {
    setFilters(newFilters)
    setPage(0)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setPage(0)
  }

  useEffect(() => {
    loadFacturas()
  }, [page, size])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (factura: FacturaResponse) => `#${factura.id}`,
    },
    {
      key: "cliente",
      label: "Cliente",
      render: (factura: FacturaResponse) => factura.cliente.usuario.nombreCompleto,
    },
    {
      key: "vehiculo",
      label: "Vehículo",
      render: (factura: FacturaResponse) => (
        <div>
          <div className="font-medium">{factura.mantenimiento.vehiculo.placa}</div>
          <div className="text-sm text-muted-foreground">
            {factura.mantenimiento.vehiculo.marca} {factura.mantenimiento.vehiculo.modelo}
          </div>
        </div>
      ),
    },
    {
      key: "servicio",
      label: "Servicio",
      render: (factura: FacturaResponse) => factura.mantenimiento.servicio.nombre,
    },
    {
      key: "taller",
      label: "Taller",
      render: (factura: FacturaResponse) => factura.taller.nombre,
    },
    {
      key: "fechaEmision",
      label: "Fecha Emisión",
      render: (factura: FacturaResponse) => formatDate(factura.fechaEmision),
    },
    {
      key: "total",
      label: "Total",
      render: (factura: FacturaResponse) => <span className="font-medium">{formatCurrency(factura.total)}</span>,
    },
    {
      key: "actions",
      label: "Acciones",
      render: (factura: FacturaResponse) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(factura)}>
            <Eye className="h-4 w-4" />
          </Button>
          {factura.pdfUrl && (
            <Button variant="ghost" size="sm" onClick={() => {
              const getFullPdfUrl = (url: string) => url.startsWith('http') ? url : `http://localhost:8080${url}`;
              window.open(getFullPdfUrl(factura.pdfUrl!), "_blank");
            }}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(factura.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const filterFields = [
    {
      key: "mantenimientoId",
      label: "ID Mantenimiento",
      type: "number" as const,
      placeholder: "Buscar por ID de mantenimiento",
    },
    {
      key: "clienteId",
      label: "ID Cliente",
      type: "number" as const,
      placeholder: "Buscar por ID de cliente",
    },
    {
      key: "tallerId",
      label: "ID Taller",
      type: "number" as const,
      placeholder: "Buscar por ID de taller",
    },
    {
      key: "fechaEmisionDesde",
      label: "Fecha Emisión Desde",
      type: "datetime-local" as const,
    },
    {
      key: "fechaEmisionHasta",
      label: "Fecha Emisión Hasta",
      type: "datetime-local" as const,
    },
    {
      key: "minTotal",
      label: "Total Mínimo",
      type: "number" as const,
      placeholder: "Monto mínimo",
    },
    {
      key: "maxTotal",
      label: "Total Máximo",
      type: "number" as const,
      placeholder: "Monto máximo",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Facturas</h2>
          <p className="text-muted-foreground">Administra todas las facturas del sistema</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda y Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por placa, cliente, taller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              Filtros Avanzados
            </Button>
            {(Object.keys(filters).length > 0 || searchTerm) && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <AdvancedFilters filters={filters} onFiltersChange={handleFilterChange} fields={filterFields} />
          )}
        </CardContent>
      </Card>

      {/* Tabla de facturas */}
      <DataTable
        data={facturas}
        columns={columns}
        loading={loading}
        emptyMessage="No se encontraron facturas"
        emptyIcon={FileText}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {page * size + 1} a {Math.min((page + 1) * size, totalElements)} de {totalElements} resultados
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
              Anterior
            </Button>

            <span className="text-sm">
              Página {page + 1} de {totalPages}
            </span>

            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedFactura && (
        <DetailsModal
          open={showDetails}
          onOpenChange={setShowDetails}
          title={`Factura #${selectedFactura.id}`}
          data={selectedFactura}
          fields={[
            { key: "id", label: "ID Factura", render: (value) => `#${value}` },
            { key: "cliente.usuario.nombreCompleto", label: "Cliente" },
            { key: "mantenimiento.vehiculo.placa", label: "Placa Vehículo" },
            { key: "mantenimiento.vehiculo.marca", label: "Marca" },
            { key: "mantenimiento.vehiculo.modelo", label: "Modelo" },
            { key: "mantenimiento.servicio.nombre", label: "Servicio" },
            { key: "mantenimiento.trabajador.usuario.nombreCompleto", label: "Trabajador" },
            { key: "taller.nombre", label: "Taller" },
            { key: "fechaEmision", label: "Fecha Emisión", render: (value) => formatDate(value) },
            { key: "total", label: "Total", render: (value) => formatCurrency(value) },
            { key: "detalles", label: "Detalles Adicionales" },
            { key: "pdfUrl", label: "PDF", render: (value) => (value ? "Disponible" : "No disponible") },
          ]}
        />
      )}
    </div>
  )
}
