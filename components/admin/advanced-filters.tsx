"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter, X } from "lucide-react"
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
  const [isMounted, setIsMounted] = useState(false)
  
  // Evitar problemas de hidratación entre servidor y cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
            className="h-8 text-sm"
          />
        )

      case "select":
        const options = filter.options || additionalData?.[filter.key] || []
        return (
          <Select value={value || "all"} onValueChange={(val) => handleFilterChange(filter.key, val)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={`Seleccionar ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {options.map((option) => (
                // Asegurarse de que el valor nunca sea una cadena vacía
                <SelectItem 
                  key={option.value} 
                  value={option.value || `option-${option.label}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "date":
        return (
          <Input
            type="date"
            value={value ? value.substring(0, 10) : ""}
            onChange={(e) => {
              const selectedDate = e.target.value;
              if (selectedDate) {
                // Convertir a formato ISO para mantener consistencia
                const date = new Date(selectedDate);
                handleFilterChange(filter.key, date.toISOString());
              } else {
                handleFilterChange(filter.key, "");
              }
            }}
            className="w-full h-8 text-sm"
          />
        )

      default:
        return null
    }
  }

  // Si no estamos montados en el cliente, mostramos solo el botón sin funcionalidad
  if (!isMounted) {
    return (
      <Button variant="outline" className="relative bg-transparent">
        <Filter className="mr-2 h-4 w-4" />
        Filtros Avanzados
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>
    );
  }
  
  // Renderizado completo cuando estamos en el cliente
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
      <PopoverContent className="w-96 p-3 max-h-[50vh] overflow-y-auto" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Avanzados</h4>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-1">
                <Label htmlFor={filter.key} className="text-sm">{filter.label}</Label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 mt-2 border-t">
            <Button onClick={handleApplyFilters} className="flex-1 h-8 text-sm">
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={handleClearFilters} className="h-8 text-sm">
              Limpiar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
