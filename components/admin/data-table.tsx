"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, Eye } from "lucide-react"

interface Column {
  key: string
  header: string
  render?: (item: any) => React.ReactNode
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  totalPages: number
  currentPage: number
  totalElements: number
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  onPageSizeChange: (size: number) => void
  pageSize: number
  isLoading: boolean
  actions?: (item: any) => React.ReactNode
  showDetails?: boolean
  onViewDetails?: (item: any) => void
}

export function DataTable({
  data,
  columns,
  totalPages,
  currentPage,
  totalElements,
  onPageChange,
  onSearch,
  onPageSizeChange,
  pageSize,
  isLoading,
  actions,
  showDetails = false,
  onViewDetails,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getValue = (item: any, key: string) => {
    return key.split(".").reduce((obj, k) => obj?.[k], item)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-8"
          />
        </div>
        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th key={column.key} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  {column.header}
                </th>
              ))}
              {(actions || showDetails) && (
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions || showDetails ? 1 : 0)} className="h-24 text-center">
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions || showDetails ? 1 : 0)} className="h-24 text-center">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={column.key} className="p-4 align-middle">
                      {column.render ? column.render(item) : getValue(item, column.key)}
                    </td>
                  ))}
                  {(actions || showDetails) && (
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {showDetails && onViewDetails && (
                          <Button variant="outline" size="sm" onClick={() => onViewDetails(item)} title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {actions && actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de{" "}
            {totalElements} resultados
          </p>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-[70px]">
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

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber
              if (totalPages <= 5) {
                pageNumber = i
              } else if (currentPage < 3) {
                pageNumber = i
              } else if (currentPage > totalPages - 4) {
                pageNumber = totalPages - 5 + i
              } else {
                pageNumber = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber + 1}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
