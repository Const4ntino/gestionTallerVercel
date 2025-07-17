"use client"

import type { AlertaResponse } from "@/types/alertas-cliente"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, AlertTriangle, Package, CheckCircle, FileText, Eye, Archive } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AlertaCardProps {
  alerta: AlertaResponse
  onMarcarVista: (id: number) => void
  onMarcarResuelta: (id: number) => void
}

const tipoIcons = {
  MANTENIMIENTO_PREVENTIVO: Wrench,
  FALLA_MECANICA: AlertTriangle,
  STOCK_BAJO: Package,
  VEHICULO_LISTO: CheckCircle,
  NUEVA_SOLICITUD: FileText,
}

const tipoColors = {
  MANTENIMIENTO_PREVENTIVO: "bg-blue-50 border-blue-200",
  FALLA_MECANICA: "bg-red-50 border-red-200",
  STOCK_BAJO: "bg-yellow-50 border-yellow-200",
  VEHICULO_LISTO: "bg-green-50 border-green-200",
  NUEVA_SOLICITUD: "bg-purple-50 border-purple-200",
}

const estadoColors = {
  NUEVA: "bg-red-100 text-red-800",
  VISTA: "bg-blue-100 text-blue-800",
  RESUELTA: "bg-green-100 text-green-800",
}

const tipoLabels = {
  MANTENIMIENTO_PREVENTIVO: "Mantenimiento Preventivo",
  FALLA_MECANICA: "Falla Mecánica",
  STOCK_BAJO: "Stock Bajo",
  VEHICULO_LISTO: "Vehículo Listo",
  NUEVA_SOLICITUD: "Nueva Solicitud",
}

export function AlertaCard({ alerta, onMarcarVista, onMarcarResuelta }: AlertaCardProps) {
  const IconComponent = tipoIcons[alerta.tipo] || FileText
  const cardColor = tipoColors[alerta.tipo] || "bg-gray-50 border-gray-200"
  const estadoColor = estadoColors[alerta.estado] || "bg-gray-100 text-gray-800"
  const tipoLabel = tipoLabels[alerta.tipo] || alerta.tipo

  return (
    <Card className={`${cardColor} ${alerta.estado === "NUEVA" ? "ring-2 ring-blue-200" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-sm">{tipoLabel}</h3>
              {alerta.vehiculo && <p className="text-xs text-gray-500">Vehículo: {alerta.vehiculo.placa}</p>}
            </div>
          </div>
          <Badge variant="secondary" className={estadoColor}>
            {alerta.estado}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 mb-3">{alerta.mensaje}</p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {format(new Date(alerta.fechaCreacion), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
          </div>

          <div className="flex gap-2">
            {alerta.estado === "NUEVA" && (
              <Button size="sm" variant="outline" onClick={() => onMarcarVista(alerta.id)} className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Marcar como leída
              </Button>
            )}

            {alerta.estado === "VISTA" && (
              <Button size="sm" variant="outline" onClick={() => onMarcarResuelta(alerta.id)} className="text-xs">
                <Archive className="h-3 w-3 mr-1" />
                Archivar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
