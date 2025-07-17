"use client"

import type { AlertaResponse } from "@/types/alertas-cliente"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, AlertTriangle, Package, CheckCircle, FileText, Eye, Archive, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AlertaCardProps {
  alerta: AlertaResponse
  onMarcarVista: (id: number) => void
  onMarcarResuelta: (id: number) => void
  isLoading?: boolean
}

const tipoIcons = {
  MANTENIMIENTO_PREVENTIVO: Wrench,
  FALLA_MECANICA: AlertTriangle,
  STOCK_BAJO: Package,
  VEHICULO_LISTO: CheckCircle,
  NUEVA_SOLICITUD: FileText,
}

const tipoColors = {
  MANTENIMIENTO_PREVENTIVO: "bg-blue-50 border-blue-200 text-blue-800",
  FALLA_MECANICA: "bg-red-50 border-red-200 text-red-800",
  STOCK_BAJO: "bg-orange-50 border-orange-200 text-orange-800",
  VEHICULO_LISTO: "bg-green-50 border-green-200 text-green-800",
  NUEVA_SOLICITUD: "bg-purple-50 border-purple-200 text-purple-800",
}

const tipoLabels = {
  MANTENIMIENTO_PREVENTIVO: "Mantenimiento Preventivo",
  FALLA_MECANICA: "Falla Mecánica",
  STOCK_BAJO: "Stock Bajo",
  VEHICULO_LISTO: "Vehículo Listo",
  NUEVA_SOLICITUD: "Nueva Solicitud",
}

const estadoColors = {
  NUEVA: "bg-yellow-100 border-yellow-300",
  VISTA: "bg-gray-100 border-gray-300",
  RESUELTA: "bg-green-100 border-green-300",
}

export function AlertaCard({ alerta, onMarcarVista, onMarcarResuelta, isLoading }: AlertaCardProps) {
  const IconComponent = tipoIcons[alerta.tipo]
  const tipoColor = tipoColors[alerta.tipo]
  const estadoColor = estadoColors[alerta.estado]
  const tipoLabel = tipoLabels[alerta.tipo]

  const formatearFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
    } catch (error) {
      return fecha
    }
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${estadoColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${tipoColor}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1">
                {tipoLabel}
              </Badge>
              {alerta.vehiculo && <p className="text-sm text-muted-foreground">Vehículo: {alerta.vehiculo.placa}</p>}
            </div>
          </div>
          <Badge
            variant={alerta.estado === "NUEVA" ? "default" : "secondary"}
            className={alerta.estado === "NUEVA" ? "bg-yellow-500" : ""}
          >
            {alerta.estado === "NUEVA" ? "Nueva" : "Vista"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{alerta.mensaje}</p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Calendar className="h-3 w-3" />
          <span>{formatearFecha(alerta.fechaCreacion)}</span>
          {alerta.taller && (
            <>
              <span>•</span>
              <span>{alerta.taller.nombre}</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {alerta.estado === "NUEVA" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarcarVista(alerta.id)}
              disabled={isLoading}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Marcar como leída
            </Button>
          )}

          {alerta.estado === "VISTA" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarcarResuelta(alerta.id)}
              disabled={isLoading}
              className="flex-1"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
