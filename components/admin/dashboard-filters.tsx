"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Filter, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { DashboardFiltersType } from "@/types/dashboard"

interface DashboardFiltersProps {
  onFiltersChange: (filters: DashboardFiltersType) => void
  isLoading?: boolean
}

export function DashboardFilters({ onFiltersChange, isLoading }: DashboardFiltersProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [groupBy, setGroupBy] = useState<"MONTH" | "YEAR">("MONTH")

  const handleApplyFilters = () => {
    const filters: DashboardFiltersType = {
      groupBy,
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
    }

    console.log("🔍 Aplicando filtros del dashboard:", filters)
    onFiltersChange(filters)
  }

  const handleClearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setGroupBy("MONTH")

    const filters: DashboardFiltersType = {
      groupBy: "MONTH",
    }

    console.log("🧹 Limpiando filtros del dashboard")
    onFiltersChange(filters)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros del Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 items-end">
          {/* Fecha de Inicio */}
          <div className="space-y-2">
            <Label>Fecha de Inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de Fin */}
          <div className="space-y-2">
            <Label>Fecha de Fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Agrupación */}
          <div className="space-y-2">
            <Label>Agrupar por</Label>
            <Select value={groupBy} onValueChange={(value: "MONTH" | "YEAR") => setGroupBy(value)}>
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
