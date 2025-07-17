"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw } from "lucide-react"
import type { DashboardFiltersType } from "@/types/dashboard"

interface DashboardFiltersProps {
  onFiltersChange: (filters: DashboardFiltersType) => void
  isLoading?: boolean
}

export function DashboardFilters({ onFiltersChange, isLoading }: DashboardFiltersProps) {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [groupBy, setGroupBy] = useState<"MONTH" | "YEAR">("MONTH")

  const handleApplyFilters = () => {
    const filters: DashboardFiltersType = {
      groupBy,
    }

    // Convertir fechas según el modo de agrupación
    if (groupBy === "MONTH") {
      if (startDate) {
        // "2025-07" => primer día del mes
        const [year, month] = startDate.split("-");
        const start = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0);
        filters.startDate = start.toISOString();
      }
      if (endDate) {
        // "2025-08" => último día del mes
        const [year, month] = endDate.split("-");
        // Día 0 del mes siguiente es el último día del mes actual
        const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
        filters.endDate = end.toISOString();
      }
    } else if (groupBy === "YEAR") {
      if (startDate) {
        // Solo año: primer día del año
        const year = Number(startDate);
        const start = new Date(year, 0, 1, 0, 0, 0, 0);
        filters.startDate = start.toISOString();
      }
      if (endDate) {
        // Solo año: último día del año
        const year = Number(endDate);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);
        filters.endDate = end.toISOString();
      }
    }

    console.log("🔍 Aplicando filtros del dashboard:", filters)
    onFiltersChange(filters)
  }

  const handleClearFilters = () => {
    setStartDate("")
    setEndDate("")
    setGroupBy("MONTH")

    const filters: DashboardFiltersType = {
      groupBy: "MONTH",
    }

    console.log("🧹 Limpiando filtros del dashboard")
    onFiltersChange(filters)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4 items-end">
          {/* Fecha de Inicio */}
          <div className="space-y-2">
            <Label htmlFor="startDate">{groupBy === "MONTH" ? "Mes de Inicio" : "Año de Inicio"}</Label>
            {groupBy === "MONTH" ? (
              <Input
                id="startDate"
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            ) : (
              <Input
                id="startDate"
                type="number"
                min={2000}
                max={2100}
                step={1}
                placeholder="YYYY"
                value={startDate}
                onChange={e => setStartDate(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                disabled={isLoading}
              />
            )}
          </div>

          {/* Fecha de Fin */}
          <div className="space-y-2">
            <Label htmlFor="endDate">{groupBy === "MONTH" ? "Mes de Fin" : "Año de Fin"}</Label>
            {groupBy === "MONTH" ? (
              <Input
                id="endDate"
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            ) : (
              <Input
                id="endDate"
                type="number"
                min={2000}
                max={2100}
                step={1}
                placeholder="YYYY"
                value={endDate}
                onChange={e => setEndDate(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                disabled={isLoading}
              />
            )}
          </div>

          {/* Agrupación */}
          <div className="space-y-2">
            <Label>Agrupar por</Label>
            <Select value={groupBy} onValueChange={(value: "MONTH" | "YEAR") => setGroupBy(value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTH">Mensual</SelectItem>
                <SelectItem value="YEAR">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} disabled={isLoading} className="flex-1">
              Aplicar
            </Button>
            <Button variant="outline" onClick={handleClearFilters} disabled={isLoading}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
