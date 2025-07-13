"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { FilterParams } from "@/types/admin"

interface FilterOption {
  key: string
  label: string
  type: "text" | "select" | "date"
  options?: { value: string; label: string }[]
}

interface AdvancedFiltersProps {
  filters: FilterOption[]
  onApplyFilters: (filters: FilterParams) => void
  onClearFilters: () => void
  additionalData?: Record<string, any[]> // Para opciones dinámicas como talleres
}

export function AdvancedFilters({ filters, onApplyFilters, onClearFilters, additionalData }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleApplyFilters = () => {
    const cleanFilters = Object.entries(filterValues).reduce(
      (acc, [key, value]) => {
        if (value && value !== "") {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, any>,
    )

    setActiveFiltersCount(Object.keys(cleanFilters).length)
    onApplyFilters(cleanFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setFilterValues({})
    setActiveFiltersCount(0)
    onClearFilters()
    setIsOpen(false)
  }

  const renderFilterInput = (filter: FilterOption) => {
    const value = filterValues[filter.key] || ""

    switch (filter.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
          />
        )

      case "select":
        const options = filter.options || additionalData?.[filter.key] || []
        return (
          <Select value={value} onValueChange={(val) => handleFilterChange(filter.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Seleccionar ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP", { locale: es }) : `Seleccionar ${filter.label.toLowerCase()}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleFilterChange(filter.key, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      default:
        return null
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative bg-transparent">
          <Filter className="mr-2 h-4 w-4" />
          Filtros Avanzados
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Avanzados</h4>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label htmlFor={filter.key}>{filter.label}</Label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleApplyFilters} className="flex-1">
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
