"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/admin/data-table"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FacturaDetailsModal } from "@/components/cliente/factura-details-modal"
import type { FacturaClientePage, FacturaClienteFilters } from "@/types/facturas-cliente"
import { obtenerMisFacturas, formatearFecha, formatearMoneda } from "@/lib/facturas-cliente-api"
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Hash,
  X,
} from "lucide-react"
import { toast } from "sonner"

export default function MisFacturasPage() {
  const [facturas, setFacturas] = useState<FacturaClientePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFacturaId, setSelectedFacturaId] = useState<number | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [filtrosDropdownOpen, setFiltrosDropdownOpen] = useState(false)

  // Estados para filtros
  const [filtros, setFiltros] = useState<FacturaClienteFilters>({
    page: 0,
    size: 10,
    sort: "fechaEmision,desc",
  })

  const cargarFacturas = async () => {
    setLoading(true)
    try {
      const data = await obtenerMisFacturas(filtros)
      setFacturas(data)
    } catch (error) {
      console.error("Error al cargar facturas:", error)
      toast.error("Error al cargar las facturas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarFacturas()
  }, [filtros])

  const handleFiltroChange = (key: keyof FacturaClienteFilters, value: any) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: value,
      page: 0, // Reset page when filters change
    }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      page: 0,
      size: 10,
      sort: "fechaEmision,desc",
    })
    setFiltrosDropdownOpen(false)
  }

  const aplicarFiltros = () => {
    cargarFacturas()
    setFiltrosDropdownOpen(false)
  }

  const handleVerDetalles = (facturaId: number) => {
    setSelectedFacturaId(facturaId)
    setDetailsModalOpen(true)
  }

  const handleDescargarPDF = (pdfUrl: string | null) => {
    if (pdfUrl) {
      const getFullPdfUrl = (url: string) => url.startsWith('http') ? url : `http://localhost:8080${url}`;
      window.open(getFullPdfUrl(pdfUrl), "_blank");
    } else {
      toast.error("PDF no disponible")
    }
  }

  const handlePageChange = (newPage: number) => {
    setFiltros((prev) => ({ ...prev, page: newPage }))
  }

  // Función para contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0
    if (filtros.search) count++
    if (filtros.mantenimientoId) count++
    if (filtros.fechaEmisionDesde) count++
    if (filtros.fechaEmisionHasta) count++
    if (filtros.minTotal) count++
    if (filtros.maxTotal) count++
    return count
  }

  const filtrosActivos = contarFiltrosActivos()

  // Definición de columnas para DataTable
  const columns = [
    {
      key: "id",
      header: "ID",
      render: (factura: any) => <span className="font-medium">#{factura.id}</span>,
    },
    {
      key: "fechaEmision",
      header: "Fecha",
      render: (factura: any) => formatearFecha(factura.fechaEmision),
    },
    {
      key: "vehiculo",
      header: "Vehículo",
      render: (factura: any) => (
        <div>
          <p className="font-medium">{factura.mantenimiento.vehiculo.placa}</p>
          <p className="text-sm text-muted-foreground">
            {factura.mantenimiento.vehiculo.marca}
            {factura.mantenimiento.vehiculo.modelo && ` ${factura.mantenimiento.vehiculo.modelo}`}
          </p>
        </div>
      ),
    },
    {
      key: "servicio",
      header: "Servicio",
      render: (factura: any) => factura.mantenimiento.servicio.nombre,
    },
    {
      key: "taller",
      header: "Taller",
      render: (factura: any) => (
        <div>
          <p className="font-medium">{factura.taller.nombre}</p>
          <p className="text-xs text-muted-foreground">{factura.taller.direccion}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (factura: any) => <span className="font-medium text-primary">{formatearMoneda(factura.total)}</span>,
    },
    {
      key: "pdfUrl",
      header: "PDF",
      render: (factura: any) => factura.pdfUrl ? (
        <Badge variant="default">Disponible</Badge>
      ) : (
        <Badge variant="secondary">No disponible</Badge>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (factura: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleVerDetalles(factura.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalles
            </DropdownMenuItem>
            {factura.pdfUrl && (
              <DropdownMenuItem onClick={() => handleDescargarPDF(factura.pdfUrl)}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="h-8 w-8" />
            Mis Facturas
          </h1>
          <p className="text-muted-foreground">Consulta y descarga tus facturas de mantenimientos</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Buscar Facturas</CardTitle>
            <DropdownMenu open={filtrosDropdownOpen} onOpenChange={setFiltrosDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avanzados
                  {filtrosActivos > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {filtrosActivos}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 p-0">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filtros de Búsqueda</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiltrosDropdownOpen(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator />

                  {/* Búsqueda General */}
                  <div className="space-y-2">
                    <Label htmlFor="search" className="flex items-center gap-2 text-sm font-medium">
                      <Search className="h-4 w-4" />
                      Búsqueda General
                    </Label>
                    <Input
                      id="search"
                      placeholder="Placa, servicio, taller..."
                      value={filtros.search || ""}
                      onChange={(e) => handleFiltroChange("search", e.target.value)}
                    />
                  </div>

                  {/* ID Mantenimiento */}
                  <div className="space-y-2">
                    <Label htmlFor="mantenimientoId" className="flex items-center gap-2 text-sm font-medium">
                      <Hash className="h-4 w-4" />
                      ID Mantenimiento
                    </Label>
                    <Input
                      id="mantenimientoId"
                      type="number"
                      placeholder="ID del mantenimiento"
                      value={filtros.mantenimientoId || ""}
                      onChange={(e) =>
                        handleFiltroChange(
                          "mantenimientoId",
                          e.target.value ? Number.parseInt(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>

                  {/* Rango de Fechas */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      Rango de Fechas
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <Label htmlFor="fechaDesde" className="text-xs text-muted-foreground">
                          Desde
                        </Label>
                        <Input
                          id="fechaDesde"
                          type="datetime-local"
                          value={filtros.fechaEmisionDesde || ""}
                          onChange={(e) => handleFiltroChange("fechaEmisionDesde", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fechaHasta" className="text-xs text-muted-foreground">
                          Hasta
                        </Label>
                        <Input
                          id="fechaHasta"
                          type="datetime-local"
                          value={filtros.fechaEmisionHasta || ""}
                          onChange={(e) => handleFiltroChange("fechaEmisionHasta", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rango de Montos */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <DollarSign className="h-4 w-4" />
                      Rango de Montos
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="minTotal" className="text-xs text-muted-foreground">
                          Mínimo
                        </Label>
                        <Input
                          id="minTotal"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={filtros.minTotal || ""}
                          onChange={(e) =>
                            handleFiltroChange(
                              "minTotal",
                              e.target.value ? Number.parseFloat(e.target.value) : undefined,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxTotal" className="text-xs text-muted-foreground">
                          Máximo
                        </Label>
                        <Input
                          id="maxTotal"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={filtros.maxTotal || ""}
                          onChange={(e) =>
                            handleFiltroChange(
                              "maxTotal",
                              e.target.value ? Number.parseFloat(e.target.value) : undefined,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Button onClick={aplicarFiltros} size="sm" className="flex-1">
                      <Search className="h-4 w-4 mr-2" />
                      Aplicar Filtros
                    </Button>
                    <Button onClick={limpiarFiltros} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {/* Búsqueda rápida */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, servicio, taller..."
              value={filtros.search || ""}
              onChange={(e) => handleFiltroChange("search", e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Mostrar filtros activos */}
          {filtrosActivos > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filtros.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: {filtros.search}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFiltroChange("search", "")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filtros.mantenimientoId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Mantenimiento: #{filtros.mantenimientoId}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFiltroChange("mantenimientoId", undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filtros.fechaEmisionDesde && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Desde: {new Date(filtros.fechaEmisionDesde).toLocaleDateString()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFiltroChange("fechaEmisionDesde", "")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filtros.fechaEmisionHasta && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Hasta: {new Date(filtros.fechaEmisionHasta).toLocaleDateString()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFiltroChange("fechaEmisionHasta", "")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filtros.minTotal && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Min: {formatearMoneda(filtros.minTotal)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFiltroChange("minTotal", undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filtros.maxTotal && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Max: {formatearMoneda(filtros.maxTotal)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleFiltroChange("maxTotal", undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Facturas */}
      <Card>
        <CardHeader>
          <CardTitle>{facturas ? `${facturas.totalElements} facturas encontradas` : "Cargando facturas..."}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : facturas && facturas.content.length > 0 ? (
            <>
              <DataTable
                data={facturas.content}
                columns={columns}
                totalPages={facturas.totalPages}
                currentPage={facturas.pageable.pageNumber}
                totalElements={facturas.totalElements}
                onPageChange={(page) => setFiltros((prev) => ({ ...prev, page }))}
                onPageSizeChange={(size) => setFiltros((prev) => ({ ...prev, size, page: 0 }))}
                pageSize={filtros.size}
                isLoading={loading}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No hay facturas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No se encontraron facturas con los filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <FacturaDetailsModal
        facturaId={selectedFacturaId}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false)
          setSelectedFacturaId(null)
        }}
      />
    </div>
  )
}
