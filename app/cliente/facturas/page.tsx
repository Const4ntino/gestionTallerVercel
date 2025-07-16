"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FacturaDetailsModal } from "@/components/cliente/factura-details-modal"
import type { FacturaClientePage, FacturaClienteFilters } from "@/types/facturas-cliente"
import { obtenerMisFacturas, formatearFecha, formatearMoneda } from "@/lib/facturas-cliente-api"
import {
  Receipt,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"

export default function MisFacturasPage() {
  const [facturas, setFacturas] = useState<FacturaClientePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [selectedFacturaId, setSelectedFacturaId] = useState<number | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

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
  }

  const handleVerDetalles = (facturaId: number) => {
    setSelectedFacturaId(facturaId)
    setDetailsModalOpen(true)
  }

  const handleDescargarPDF = (pdfUrl: string | null) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank")
    } else {
      toast.error("PDF no disponible")
    }
  }

  const handlePageChange = (newPage: number) => {
    setFiltros((prev) => ({ ...prev, page: newPage }))
  }

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

      {/* Filtros */}
      <Card>
        <Collapsible open={filtrosAbiertos} onOpenChange={setFiltrosAbiertos}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Búsqueda
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${filtrosAbiertos ? "rotate-180" : ""}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Búsqueda General</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Placa, servicio..."
                      className="pl-8"
                      value={filtros.search || ""}
                      onChange={(e) => handleFiltroChange("search", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="mantenimientoId">ID Mantenimiento</Label>
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

                <div>
                  <Label htmlFor="fechaDesde">Fecha Desde</Label>
                  <Input
                    id="fechaDesde"
                    type="datetime-local"
                    value={filtros.fechaEmisionDesde || ""}
                    onChange={(e) => handleFiltroChange("fechaEmisionDesde", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="fechaHasta">Fecha Hasta</Label>
                  <Input
                    id="fechaHasta"
                    type="datetime-local"
                    value={filtros.fechaEmisionHasta || ""}
                    onChange={(e) => handleFiltroChange("fechaEmisionHasta", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="minTotal">Monto Mínimo</Label>
                  <Input
                    id="minTotal"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filtros.minTotal || ""}
                    onChange={(e) =>
                      handleFiltroChange("minTotal", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="maxTotal">Monto Máximo</Label>
                  <Input
                    id="maxTotal"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filtros.maxTotal || ""}
                    onChange={(e) =>
                      handleFiltroChange("maxTotal", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={cargarFacturas} size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button onClick={limpiarFiltros} variant="outline" size="sm">
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>PDF</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.content.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell className="font-medium">#{factura.id}</TableCell>
                        <TableCell>{formatearFecha(factura.fechaEmision)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{factura.mantenimiento.vehiculo.placa}</p>
                            <p className="text-sm text-muted-foreground">{factura.mantenimiento.vehiculo.marca}</p>
                          </div>
                        </TableCell>
                        <TableCell>{factura.mantenimiento.servicio.nombre}</TableCell>
                        <TableCell className="font-medium text-primary">{formatearMoneda(factura.total)}</TableCell>
                        <TableCell>
                          {factura.pdfUrl ? (
                            <Badge variant="default">Disponible</Badge>
                          ) : (
                            <Badge variant="secondary">No disponible</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {facturas.totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Página {facturas.pageable.pageNumber + 1} de {facturas.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(facturas.pageable.pageNumber - 1)}
                      disabled={facturas.first}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(facturas.pageable.pageNumber + 1)}
                      disabled={facturas.last}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
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
