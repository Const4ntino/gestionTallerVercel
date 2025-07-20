"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import { AdvancedFilters } from "@/components/admin/advanced-filters"
import { DataTable } from "@/components/admin/data-table"
import type { FacturaResponse, FacturaFilterParams } from "@/types/facturas"
import { MetodoPago } from "@/types/facturas"
import type { PageResponse } from "@/types/admin"
import { Search, FileText, Eye, Download, Trash2, X } from "lucide-react"
import { debounce } from "lodash"

interface FilterParams {
  search?: string
  mantenimientoId?: number
  clienteId?: number
  tallerId?: number
  fechaEmisionDesde?: string
  fechaEmisionHasta?: string
  minTotal?: number
  maxTotal?: number
  metodoPago?: MetodoPago
}

export function GestionFacturas() {
  const [facturas, setFacturas] = useState<FacturaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({})
  const [selectedFactura, setSelectedFactura] = useState<FacturaResponse | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Función debounced para búsqueda automática
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.length >= 2 || term.length === 0) {
        setPage(0)
        loadFacturas(0, size, { ...currentFilters, search: term })
      }
    }, 500),
    [currentFilters, size],
  )

  const loadFacturas = async (currentPage = page, currentSize = size, filters: FilterParams = {}) => {
    try {
      setLoading(true)

      const filterParams: FacturaFilterParams = {
        ...filters,
        search: filters.search?.trim() || undefined,
        page: currentPage,
        size: currentSize,
      }

      const response: PageResponse<FacturaResponse> = await facturasApi.filter(filterParams)
      setFacturas(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
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

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    debouncedSearch(term)
  }

  const handleApplyFilters = (filters: FilterParams) => {
    setCurrentFilters(filters)
    setPage(0)
    loadFacturas(0, size, { ...filters, search: searchTerm })
  }

  const handleClearFilters = () => {
    setCurrentFilters({})
    setSearchTerm("")
    setPage(0)
    loadFacturas(0, size, {})
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    loadFacturas(newPage, size, { ...currentFilters, search: searchTerm })
  }

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
    loadFacturas(0, newSize, { ...currentFilters, search: searchTerm })
  }

  useEffect(() => {
    loadFacturas()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (factura: FacturaResponse) => `#${factura.id}`,
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (factura: FacturaResponse) => factura.cliente?.usuario?.nombreCompleto ?? "Sin cliente",
    },
    {
      key: "taller",
      header: "Taller",
      render: (factura: FacturaResponse) => factura.taller?.nombre ?? "Sin taller",
    },
    {
      key: "vehiculo",
      header: "Vehículo",
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
      header: "Servicio",
      render: (factura: FacturaResponse) => factura.mantenimiento.servicio.nombre,
    },
    {
      key: "fechaEmision",
      header: "Fecha Emisión",
      render: (factura: FacturaResponse) => formatDate(factura.fechaEmision),
    },
    {
      key: "total",
      header: "Total",
      render: (factura: FacturaResponse) => <span className="font-medium">{formatCurrency(factura.total)}</span>,
    },
    {
      key: "metodoPago",
      header: "Método de Pago",
      render: (factura: FacturaResponse) => factura.metodoPago,
    },
  ]

  const actions = (factura: FacturaResponse) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(factura)}>
        <Eye className="h-4 w-4" />
      </Button>
      {factura.pdfUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const getFullPdfUrl = (url: string) => (url.startsWith("http") ? url : `http://localhost:8080${url}`)
            window.open(getFullPdfUrl(factura.pdfUrl!), "_blank")
          }}
        >
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
  )

  const filterFields = [
    {
      key: "mantenimientoId",
      label: "ID Mantenimiento",
      type: "text" as const,
      placeholder: "ID del mantenimiento",
    },
    {
      key: "clienteId",
      label: "ID Cliente",
      type: "text" as const,
      placeholder: "ID del cliente",
    },
    {
      key: "tallerId",
      label: "ID Taller",
      type: "text" as const,
      placeholder: "ID del taller",
    },
    {
      key: "fechaEmisionDesde",
      label: "Fecha Emisión Desde",
      type: "date" as const,
    },
    {
      key: "fechaEmisionHasta",
      label: "Fecha Emisión Hasta",
      type: "date" as const,
    },
    {
      key: "minTotal",
      label: "Total Mínimo",
      type: "text" as const,
      placeholder: "Monto mínimo",
    },
    {
      key: "maxTotal",
      label: "Total Máximo",
      type: "text" as const,
      placeholder: "Monto máximo",
    },
  ]

  const additionalData = {
    metodoPago: [
      { value: "", label: "Todos" },
      { value: MetodoPago.EN_EFECTIVO, label: "Efectivo" },
      { value: MetodoPago.TRANSFERENCIA, label: "Transferencia" },
      { value: MetodoPago.YAPE, label: "Yape" },
      { value: MetodoPago.PLIN, label: "Plin" },
      { value: MetodoPago.DEPOSITO, label: "Depósito" },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Facturas</h2>
          <p className="text-muted-foreground">Administra todas las facturas del sistema</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros unificada */}
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
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => loadFacturas(0, size, { ...currentFilters, search: searchTerm })}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <AdvancedFilters
              filters={[...filterFields, { key: "metodoPago", label: "Método de Pago", type: "select" as const }]}
              onApplyFilters={handleApplyFilters}
              onClearFilters={() => {
                setCurrentFilters({})
                loadFacturas(0, size, { search: searchTerm })
              }}
              additionalData={additionalData}
            />
            {(Object.keys(currentFilters).length > 0 || searchTerm) && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar Todo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de facturas */}
      <DataTable<FacturaResponse>
        data={facturas}
        columns={columns as any}
        totalPages={totalPages}
        currentPage={page}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSize={size}
        isLoading={loading}
        actions={actions}
        showDetails={true}
        onViewDetails={handleViewDetails}
        emptyMessage="No se encontraron facturas"
        emptyIcon={FileText}
      />

      {/* Modal de detalles */}
      {showDetails && selectedFactura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Detalles de la Factura #{selectedFactura.id}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p>{selectedFactura.cliente?.usuario?.nombreCompleto || "--"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taller</p>
                  <p>{selectedFactura.taller?.nombre || "--"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
                  <p>{selectedFactura.mantenimiento?.vehiculo?.placa || "--"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Servicio</p>
                  <p>{selectedFactura.mantenimiento?.servicio?.nombre || "--"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Emisión</p>
                  <p>{formatDate(selectedFactura.fechaEmision)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Método de Pago</p>
                  <p>{selectedFactura.metodoPago || "--"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="font-medium">{formatCurrency(selectedFactura.total)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Detalles</p>
                <p>{selectedFactura.detalles || "Sin detalles"}</p>
              </div>
              {selectedFactura.pdfUrl && (
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      const getFullPdfUrl = (url: string) =>
                        url.startsWith("http") ? url : `http://localhost:8080${url}`
                      window.open(getFullPdfUrl(selectedFactura.pdfUrl!), "_blank")
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
