"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import { AdvancedFilters } from "@/components/admin/advanced-filters"
import { DataTable } from "@/components/admin/data-table"
import type { FacturaResponse, FacturaFilterParams } from "@/types/facturas"
import { MetodoPago } from "@/types/facturas"
import type { PageResponse } from "@/types/admin"
import { Search, FileText, Eye, Download, Trash2, X, ImageIcon, Receipt, CreditCard } from "lucide-react"

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

  // Función personalizada para manejar el debounce de la búsqueda
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  useEffect(() => {
    // Crear un timer para retrasar la búsqueda
    const timer = setTimeout(() => {
      if (debouncedSearchTerm.length >= 2 || debouncedSearchTerm.length === 0) {
        setPage(0);
        loadFacturas(0, size, { ...currentFilters, search: debouncedSearchTerm });
      }
    }, 500);
    
    // Limpiar el timer si el término cambia antes de que se ejecute
    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, currentFilters, size]);

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
    setDebouncedSearchTerm(term)
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

  const getMetodoPagoColor = (metodo: MetodoPago) => {
    switch (metodo) {
      case MetodoPago.EN_EFECTIVO:
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case MetodoPago.TRANSFERENCIA:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case MetodoPago.YAPE:
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case MetodoPago.PLIN:
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case MetodoPago.DEPOSITO:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getMetodoPagoLabel = (metodo: MetodoPago) => {
    switch (metodo) {
      case MetodoPago.EN_EFECTIVO:
        return "Efectivo"
      case MetodoPago.TRANSFERENCIA:
        return "Transferencia"
      case MetodoPago.YAPE:
        return "Yape"
      case MetodoPago.PLIN:
        return "Plin"
      case MetodoPago.DEPOSITO:
        return "Depósito"
      default:
        return metodo
    }
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (factura: FacturaResponse) => (
        <div className="flex flex-col">
          <span className="font-medium">#{factura.id}</span>
          {factura.codigoFactura && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              {factura.codigoFactura}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (factura: FacturaResponse) => (
        <div className="min-w-[150px]">
          <div className="font-medium">{factura.cliente?.usuario?.nombreCompleto ?? "Sin cliente"}</div>
          <div className="text-sm text-muted-foreground">ID: {factura.cliente?.id ?? "--"}</div>
        </div>
      ),
    },
    {
      key: "vehiculo",
      header: "Vehículo",
      render: (factura: FacturaResponse) => (
        <div className="min-w-[120px]">
          <div className="font-medium">{factura.mantenimiento.vehiculo.placa}</div>
          <div className="text-sm text-muted-foreground">
            {factura.mantenimiento.vehiculo.marca} {factura.mantenimiento.vehiculo.modelo}
          </div>
        </div>
      ),
    },
    {
      key: "servicio",
      header: "Servicio & Taller",
      render: (factura: FacturaResponse) => (
        <div className="min-w-[150px]">
          <div className="font-medium">{factura.mantenimiento.servicio.nombre}</div>
          <div className="text-sm text-muted-foreground">{factura.taller?.nombre ?? "Sin taller"}</div>
        </div>
      ),
    },
    {
      key: "fechaEmision",
      header: "Fecha Emisión",
      render: (factura: FacturaResponse) => <div className="text-sm">{formatDate(factura.fechaEmision)}</div>,
    },
    {
      key: "total",
      header: "Total",
      render: (factura: FacturaResponse) => (
        <div className="text-right">
          <span className="font-bold text-lg">{formatCurrency(factura.total)}</span>
        </div>
      ),
    },
    {
      key: "metodoPago",
      header: "Método de Pago",
      render: (factura: FacturaResponse) => (
        <div className="min-w-[140px]">
          <Badge className={`${getMetodoPagoColor(factura.metodoPago)} mb-2`}>
            <CreditCard className="h-3 w-3 mr-1" />
            {getMetodoPagoLabel(factura.metodoPago)}
          </Badge>

          {factura.metodoPago !== MetodoPago.EN_EFECTIVO && (
            <div className="space-y-1">
              {factura.nroOperacion && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Op:</span> {factura.nroOperacion}
                </div>
              )}
              {factura.imagenOperacion && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    const getFullImageUrl = (url: string) =>
                      url.startsWith("http") ? url : `http://localhost:8080${url}`
                    window.open(getFullImageUrl(factura.imagenOperacion!), "_blank")
                  }}
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Ver Comprobante
                </Button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ]

  const actions = (factura: FacturaResponse) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(factura)} title="Ver detalles">
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
          title="Descargar PDF"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(factura.id)}
        className="text-destructive hover:text-destructive"
        title="Eliminar factura"
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
      { value: "", label: "Todos los métodos" },
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
                placeholder="Buscar por placa, cliente, taller, código de factura..."
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
        onViewDetails={handleViewDetails}
        emptyMessage="No se encontraron facturas"
        emptyIcon={FileText}
      />

      {/* Modal de detalles mejorado */}
      {showDetails && selectedFactura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">Detalles de la Factura #{selectedFactura.id}</h3>
                {selectedFactura.codigoFactura && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Receipt className="h-4 w-4" />
                    Código: {selectedFactura.codigoFactura}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del Cliente y Vehículo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cliente y Vehículo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                    <p className="font-medium">{selectedFactura.cliente?.usuario?.nombreCompleto || "--"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
                    <p className="font-medium">{selectedFactura.mantenimiento?.vehiculo?.placa || "--"}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFactura.mantenimiento?.vehiculo?.marca} {selectedFactura.mantenimiento?.vehiculo?.modelo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taller</p>
                    <p>{selectedFactura.taller?.nombre || "--"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Información del Servicio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Servicio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Servicio</p>
                    <p className="font-medium">{selectedFactura.mantenimiento?.servicio?.nombre || "--"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Emisión</p>
                    <p>{formatDate(selectedFactura.fechaEmision)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedFactura.total)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Información de Pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Método de Pago</p>
                    <Badge className={`${getMetodoPagoColor(selectedFactura.metodoPago)}`}>
                      <CreditCard className="h-3 w-3 mr-1" />
                      {getMetodoPagoLabel(selectedFactura.metodoPago)}
                    </Badge>
                  </div>

                  {selectedFactura.metodoPago !== MetodoPago.EN_EFECTIVO && (
                    <>
                      {selectedFactura.nroOperacion && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Número de Operación</p>
                          <p className="font-mono">{selectedFactura.nroOperacion}</p>
                        </div>
                      )}

                      {selectedFactura.imagenOperacion && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Comprobante de Pago</p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const getFullImageUrl = (url: string) =>
                                url.startsWith("http") ? url : `http://localhost:8080${url}`
                              window.open(getFullImageUrl(selectedFactura.imagenOperacion!), "_blank")
                            }}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Ver Comprobante
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Detalles Adicionales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles Adicionales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                    <p className="text-sm">{selectedFactura.detalles || "Sin observaciones"}</p>
                  </div>

                  {selectedFactura.pdfUrl && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Documento PDF</p>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
