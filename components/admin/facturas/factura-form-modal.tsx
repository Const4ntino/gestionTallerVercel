"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import type { MantenimientoPendienteFacturar, CalculatedTotalResponse, FacturaRequest } from "@/types/facturas"
import { Car, User, Wrench, Package, Receipt } from "lucide-react"

interface FacturaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantenimiento: MantenimientoPendienteFacturar
  calculatedTotal: CalculatedTotalResponse
  onSuccess: () => void
}

export function FacturaFormModal({
  open,
  onOpenChange,
  mantenimiento,
  calculatedTotal,
  onSuccess,
}: FacturaFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [detalles, setDetalles] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const facturaRequest: FacturaRequest = {
        mantenimientoId: mantenimiento.id,
        clienteId: mantenimiento.vehiculo.cliente.id,
        tallerId: mantenimiento.servicio.taller.id,
        detalles: detalles.trim() || undefined,
      }

      await facturasApi.create(facturaRequest)
      onSuccess()
    } catch (error) {
      console.error("Error al crear factura:", error)
      toast.error("Error al crear la factura")
    } finally {
      setLoading(false)
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Crear Factura
          </DialogTitle>
          <DialogDescription>Crear factura para el mantenimiento completado</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Mantenimiento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Mantenimiento</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Vehículo:</span>
                  <span>
                    {mantenimiento.vehiculo.marca} {mantenimiento.vehiculo.modelo}
                  </span>
                  <Badge variant="outline">{mantenimiento.vehiculo.placa}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cliente:</span>
                  <span>{mantenimiento.vehiculo.cliente.usuario.nombreCompleto}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Servicio:</span>
                  <span>{mantenimiento.servicio.nombre}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-medium">Trabajador:</span>
                  <span className="ml-2">{mantenimiento.trabajador.usuario.nombreCompleto}</span>
                  <Badge className="ml-2" variant="secondary">
                    {mantenimiento.trabajador.especialidad}
                  </Badge>
                </div>

                <div>
                  <span className="font-medium">Taller:</span>
                  <span className="ml-2">{mantenimiento.servicio.taller.nombre}</span>
                </div>

                <div>
                  <span className="font-medium">Finalizado:</span>
                  <span className="ml-2">{formatDate(mantenimiento.fechaFin)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos Utilizados */}
          {mantenimiento.productosUsados && mantenimiento.productosUsados.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos Utilizados
              </h3>

              <div className="space-y-2">
                {mantenimiento.productosUsados.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div>
                      <span className="font-medium">{producto.producto.nombre}</span>
                      <span className="text-muted-foreground ml-2">
                        x{producto.cantidadUsada} @ {formatCurrency(producto.precioEnUso)}
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(producto.precioEnUso * producto.cantidadUsada)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Total Calculado */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resumen de Facturación</h3>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total a Facturar:</span>
                <span className="font-bold text-primary">{formatCurrency(calculatedTotal.totalCalculado)}</span>
              </div>
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="space-y-2">
            <Label htmlFor="detalles">Detalles Adicionales (Opcional)</Label>
            <Textarea
              id="detalles"
              placeholder="Ingrese detalles adicionales para la factura..."
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Factura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
