"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import { FacturaFormModal } from "./factura-form-modal"
import type { MantenimientoPendienteFacturar, CalculatedTotalResponse } from "@/types/facturas"
import { Car, User, Wrench, Package, Receipt, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

export function MantenimientosPendientes() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoPendienteFacturar[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState("fechaFin,desc")

  // Modal states
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MantenimientoPendienteFacturar | null>(null)
  const [calculatedTotal, setCalculatedTotal] = useState<CalculatedTotalResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [calculatingTotal, setCalculatingTotal] = useState(false)

  const loadMantenimientos = async () => {
    try {
      setLoading(true)
      const response = await facturasApi.getMantenimientosPendientes({
        page: currentPage,
        size: pageSize,
        sort: sortBy,
      })

      setMantenimientos(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Error al cargar mantenimientos pendientes:", error)
      toast.error("Error al cargar los mantenimientos pendientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMantenimientos()
  }, [currentPage, pageSize, sortBy])

  const handleCreateFactura = async (mantenimiento: MantenimientoPendienteFacturar) => {
    try {
      setCalculatingTotal(true)
      const total = await facturasApi.calcularTotal(mantenimiento.id)
      setSelectedMantenimiento(mantenimiento)
      setCalculatedTotal(total)
      setModalOpen(true)
    } catch (error) {
      console.error("Error al calcular total:", error)
      toast.error("Error al calcular el total de la factura")
    } finally {
      setCalculatingTotal(false)
    }
  }

  const handleFacturaCreated = () => {
    setModalOpen(false)
    setSelectedMantenimiento(null)
    setCalculatedTotal(null)
    loadMantenimientos()
    toast.success("Factura creada exitosamente")
  }

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mantenimientos Pendientes de Facturar</h2>
          <p className="text-muted-foreground">
            {totalElements} mantenimiento{totalElements !== 1 ? "s" : ""} completado{totalElements !== 1 ? "s" : ""}{" "}
            pendiente{totalElements !== 1 ? "s" : ""} de facturación
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fechaFin,desc">Más recientes primero</SelectItem>
              <SelectItem value="fechaFin,asc">Más antiguos primero</SelectItem>
              <SelectItem value="vehiculo.placa,asc">Por placa (A-Z)</SelectItem>
              <SelectItem value="servicio.nombre,asc">Por servicio (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mantenimientos List */}
      {mantenimientos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay mantenimientos pendientes</h3>
            <p className="text-muted-foreground text-center">
              Todos los mantenimientos completados ya han sido facturados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mantenimientos.map((mantenimiento) => (
            <Card key={mantenimiento.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Mantenimiento #{mantenimiento.id}
                  </CardTitle>
                  <Badge variant="secondary">{mantenimiento.estado}</Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Finalizado: {formatDate(mantenimiento.fechaFin)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Información Principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Vehículo:</span>
                      <span>
                        {mantenimiento.vehiculo?.marca || "N/A"} {mantenimiento.vehiculo?.modelo || "N/A"}
                      </span>
                      <Badge variant="outline">{mantenimiento.vehiculo?.placa || "Sin placa"}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Cliente:</span>
                      <span>{mantenimiento.vehiculo?.cliente?.usuario?.nombreCompleto || "Cliente no disponible"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Servicio:</span>
                      <span>{mantenimiento.servicio?.nombre || "Servicio no disponible"}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Trabajador:</span>
                      <span>{mantenimiento.trabajador?.usuario?.nombreCompleto || "No asignado"}</span>
                      {mantenimiento.trabajador?.especialidad && (
                        <Badge variant="secondary">{mantenimiento.trabajador.especialidad}</Badge>
                      )}
                    </div>

                    <div>
                      <span className="font-medium">Taller:</span>
                      <span className="ml-2">{mantenimiento.servicio?.taller?.nombre || "Taller no disponible"}</span>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                {(mantenimiento.observacionesCliente || mantenimiento.observacionesTrabajador) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {mantenimiento.observacionesCliente && (
                        <div>
                          <span className="font-medium text-sm">Observaciones del Cliente:</span>
                          <p className="text-sm text-muted-foreground mt-1">{mantenimiento.observacionesCliente}</p>
                        </div>
                      )}
                      {mantenimiento.observacionesTrabajador && (
                        <div>
                          <span className="font-medium text-sm">Observaciones del Trabajador:</span>
                          <p className="text-sm text-muted-foreground mt-1">{mantenimiento.observacionesTrabajador}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Productos Utilizados */}
                {mantenimiento.productosUsados && mantenimiento.productosUsados.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Productos Utilizados
                      </h4>
                      <div className="space-y-2">
                        {mantenimiento.productosUsados.map((producto, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                          >
                            <div>
                              <span className="font-medium">{producto.producto?.nombre || "Producto sin nombre"}</span>
                              <span className="text-muted-foreground ml-2">x{producto.cantidadUsada || 0}</span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency((producto.precioEnUso || 0) * (producto.cantidadUsada || 0))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Acciones */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleCreateFactura(mantenimiento)}
                    disabled={calculatingTotal}
                    className="flex items-center gap-2"
                  >
                    <Receipt className="h-4 w-4" />
                    {calculatingTotal ? "Calculando..." : "Crear Factura"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de{" "}
            {totalElements} resultados
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="text-sm">
              Página {currentPage + 1} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedMantenimiento && calculatedTotal && (
        <FacturaFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mantenimiento={selectedMantenimiento}
          calculatedTotal={calculatedTotal}
          onSuccess={handleFacturaCreated}
        />
      )}
    </div>
  )
}
