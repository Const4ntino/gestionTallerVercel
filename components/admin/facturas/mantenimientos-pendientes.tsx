"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import { FacturaFormModal } from "./factura-form-modal"
import type { MantenimientoPendienteFacturar, CalculatedTotalResponse } from "@/types/facturas"
import type { PageResponse } from "@/types/admin"
import { Car, User, Wrench, Calendar, Package, Receipt } from "lucide-react"

export function MantenimientosPendientes() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoPendienteFacturar[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [sort, setSort] = useState("fechaFin,desc")
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<MantenimientoPendienteFacturar | null>(null)
  const [calculatedTotal, setCalculatedTotal] = useState<CalculatedTotalResponse | null>(null)
  const [showFacturaModal, setShowFacturaModal] = useState(false)

  const loadMantenimientos = async () => {
    try {
      setLoading(true)
      const response: PageResponse<MantenimientoPendienteFacturar> = await facturasApi.getMantenimientosPendientes({
        page,
        size,
        sort,
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

  const handleFacturar = async (mantenimiento: MantenimientoPendienteFacturar) => {
    try {
      const totalResponse = await facturasApi.calcularTotal(mantenimiento.id)
      setCalculatedTotal(totalResponse)
      setSelectedMantenimiento(mantenimiento)
      setShowFacturaModal(true)
    } catch (error) {
      console.error("Error al calcular total:", error)
      toast.error("Error al calcular el total de la factura")
    }
  }

  const handleFacturaCreated = () => {
    setShowFacturaModal(false)
    setSelectedMantenimiento(null)
    setCalculatedTotal(null)
    loadMantenimientos() // Recargar la lista
    toast.success("Factura creada exitosamente")
  }

  useEffect(() => {
    loadMantenimientos()
  }, [page, size, sort])

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mantenimientos Pendientes de Facturar</h2>
          <p className="text-muted-foreground">
            {totalElements} mantenimiento{totalElements !== 1 ? "s" : ""} completado{totalElements !== 1 ? "s" : ""}{" "}
            pendiente{totalElements !== 1 ? "s" : ""} de facturar
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fechaFin,desc">Fecha Fin (más reciente)</SelectItem>
              <SelectItem value="fechaFin,asc">Fecha Fin (más antigua)</SelectItem>
              <SelectItem value="fechaCreacion,desc">Fecha Creación (más reciente)</SelectItem>
              <SelectItem value="fechaCreacion,asc">Fecha Creación (más antigua)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={size.toString()} onValueChange={(value) => setSize(Number.parseInt(value))}>
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
        <div className="grid gap-6">
          {mantenimientos.map((mantenimiento) => (
            <Card key={mantenimiento.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      {mantenimiento.vehiculo.marca} {mantenimiento.vehiculo.modelo}
                      <Badge variant="outline">{mantenimiento.vehiculo.placa}</Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{mantenimiento.vehiculo.cliente?.usuario?.nombreCompleto || "Cliente no disponible"}</span>
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleFacturar(mantenimiento)}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Facturar
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Servicio:</span>
                      <span>{mantenimiento.servicio.nombre}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Trabajador:</span>
                      <span>{mantenimiento.trabajador?.usuario?.nombreCompleto || "No asignado"}</span>
                      <Badge variant="secondary">{mantenimiento.trabajador?.especialidad || "Sin especialidad"}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Finalizado:</span>
                      <span>{formatDate(mantenimiento.fechaFin)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Taller:</span>
                      <span className="ml-2">{mantenimiento.servicio.taller.nombre}</span>
                    </div>

                    <div>
                      <span className="font-medium">Estado:</span>
                      <Badge className="ml-2" variant="default">
                        {mantenimiento.estado}
                      </Badge>
                    </div>
                  </div>
                </div>

                {mantenimiento.productosUsados && mantenimiento.productosUsados.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4" />
                        Productos Utilizados
                      </h4>
                      <div className="grid gap-2">
                        {mantenimiento.productosUsados.map((producto, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div>
                              <span className="font-medium">{producto.producto.nombre}</span>
                              <span className="text-muted-foreground ml-2">x{producto.cantidadUsada}</span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(producto.precioEnUso * producto.cantidadUsada)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {(mantenimiento.observacionesCliente || mantenimiento.observacionesTrabajador) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mantenimiento.observacionesCliente && (
                        <div>
                          <h4 className="font-medium mb-2">Observaciones del Cliente</h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            {mantenimiento.observacionesCliente}
                          </p>
                        </div>
                      )}

                      {mantenimiento.observacionesTrabajador && (
                        <div>
                          <h4 className="font-medium mb-2">Observaciones del Trabajador</h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            {mantenimiento.observacionesTrabajador}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* Modal de creación de factura */}
      {selectedMantenimiento && calculatedTotal && (
        <FacturaFormModal
          open={showFacturaModal}
          onOpenChange={setShowFacturaModal}
          mantenimiento={selectedMantenimiento}
          calculatedTotal={calculatedTotal}
          onSuccess={handleFacturaCreated}
        />
      )}
    </div>
  )
}
