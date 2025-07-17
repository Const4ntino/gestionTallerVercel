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

    // Convertir fechas a formato ISO si están presentes
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      filters.startDate = start.toISOString()
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filters.endDate = end.toISOString()
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
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Fecha de Fin */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha de Fin</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
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
