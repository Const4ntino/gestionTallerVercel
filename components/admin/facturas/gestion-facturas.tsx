"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import { AdvancedFilters } from "@/components/admin/advanced-filters"
import { DataTable } from "@/components/admin/data-table"
import type { FacturaResponse, FacturaFilterParams } from "@/types/facturas"
import { MetodoPago } from "@/types/facturas"
import type { PageResponse } from "@/types/admin"
import { MoreHorizontal, FileText, Search, Filter, X, Eye, Download, Trash2 } from "lucide-react"

export function GestionFacturas() {
  const [facturas, setFacturas] = useState<FacturaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FacturaFilterParams>({})
  const [selectedFactura, setSelectedFactura] = useState<FacturaResponse | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const loadFacturas = async () => {
    try {
      setLoading(true)

      // Siempre usamos el endpoint de filtrado con paginación del servidor
      const filterParams: FacturaFilterParams = {
        ...filters,
        search: searchTerm.trim() || undefined,
        page,
        size,
        // Podemos agregar sort si es necesario
        // sort: "fechaEmision,desc",
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

  const handleSearch = () => {
    setPage(0)
    loadFacturas()
  }

  const handleFilterChange = (newFilters: any) => {
    // Convertir valores numéricos de string a number para la API
    const processedFilters = { ...newFilters }
    
    if (processedFilters.minTotal) {
      processedFilters.minTotal = Number(processedFilters.minTotal)
    }
    
    if (processedFilters.maxTotal) {
      processedFilters.maxTotal = Number(processedFilters.maxTotal)
    }
    
    if (processedFilters.mantenimientoId) {
      processedFilters.mantenimientoId = Number(processedFilters.mantenimientoId)
    }
    
    if (processedFilters.clienteId) {
      processedFilters.clienteId = Number(processedFilters.clienteId)
    }
    
    if (processedFilters.tallerId) {
      processedFilters.tallerId = Number(processedFilters.tallerId)
    }
    
    setFilters(processedFilters)
    setPage(0) // Reset to first page when filters change
    loadFacturas() // Ejecutar la petición con los nuevos filtros
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setPage(0)
    loadFacturas() // Ejecutar la petición al limpiar los filtros
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    loadFacturas()
  }

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0) // Volver a la primera página al cambiar el tamaño
    loadFacturas()
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
      render: (factura: FacturaResponse) => formatCurrency(factura.total),
    },
    {
      key: "metodoPago",
      header: "Método de Pago",
      render: (factura: FacturaResponse) => factura.metodoPago,
    },
    {
      key: "acciones",
      header: "Acciones",
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
      type: "text" as const,
      placeholder: "ID del mantenimiento",
      inputProps: { type: "number", min: 1 },
    },
    {
      key: "clienteId",
      label: "ID Cliente",
      type: "text" as const,
      placeholder: "ID del cliente",
      inputProps: { type: "number", min: 1 },
    },
    {
      key: "tallerId",
      label: "ID Taller",
      type: "text" as const,
      placeholder: "ID del taller",
      inputProps: { type: "number", min: 1 },
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
      inputProps: { 
        type: "number", 
        min: 0, 
        step: 0.01,
        className: "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      },
    },
    {
      key: "maxTotal",
      label: "Total Máximo",
      type: "text" as const,
      placeholder: "Monto máximo",
      inputProps: { 
        type: "number", 
        min: 0, 
        step: 0.01,
        className: "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      },
    },
    {
      key: "metodoPago",
      label: "Método de Pago",
      type: "select" as const,
      options: [
        { value: "", label: "Todos" },
        { value: MetodoPago.EN_EFECTIVO, label: "Efectivo" },
        { value: MetodoPago.TRANSFERENCIA, label: "Transferencia" },
        { value: MetodoPago.YAPE, label: "Yape" },
        { value: MetodoPago.PLIN, label: "Plin" },
        { value: MetodoPago.DEPOSITO, label: "Depósito" },
      ],
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
            <AdvancedFilters 
              filters={filterFields} 
              onApplyFilters={handleFilterChange} 
              onClearFilters={clearFilters} 
            />
            {(Object.keys(filters).length > 0 || searchTerm) && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
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
        showDetails={true}
        onViewDetails={handleViewDetails}
        onSearch={(term) => {
          setSearchTerm(term)
          setPage(0)
          loadFacturas()
        }}
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
                      const getFullPdfUrl = (url: string) => url.startsWith('http') ? url : `http://localhost:8080${url}`;
                      window.open(getFullPdfUrl(selectedFactura.pdfUrl!), "_blank");
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
