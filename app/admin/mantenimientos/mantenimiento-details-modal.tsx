"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DetailField {
  label: string
  value: any
  type?: "text" | "badge" | "date" | "currency"
  variant?: "default" | "secondary" | "destructive" | "outline"
}

interface DetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields?: DetailField[]
  twoColumns?: boolean
  leftColumnTitle?: string
  rightColumnTitle?: string
  leftColumnFields?: DetailField[]
  rightColumnFields?: DetailField[]
  showTotal?: boolean
  totalAmount?: number
}

export function MantenimientoDetailsModal({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  fields,
  twoColumns = false,
  leftColumnTitle = "Información Principal",
  rightColumnTitle = "Información Adicional",
  leftColumnFields = [],
  rightColumnFields = [],
  showTotal = false,
  totalAmount = 0
}: DetailsModalProps) {
  const formatValue = (field: DetailField) => {
    if (field.value === null || field.value === undefined || field.value === "") {
      return "N/A"
    }

    // Si el valor es un elemento React (JSX), devolverlo directamente
    if (React.isValidElement(field.value)) {
      return field.value;
    }

    switch (field.type) {
      case "badge":
        return <Badge variant={field.variant as any}>{String(field.value)}</Badge>
      case "date":
        try {
          if (typeof field.value === "string" && field.value.includes("T")) {
            return new Date(field.value).toLocaleString("es-ES", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          }
          return new Date(field.value).toLocaleDateString("es-ES")
        } catch {
          return String(field.value)
        }
      case "currency":
        return `S/ ${Number(field.value).toLocaleString('es-PE')}`
      default:
        // Si es un objeto pero no es un elemento React, convertirlo a string
        if (typeof field.value === 'object') {
          return JSON.stringify(field.value)
        }
        // Si es un string con saltos de línea, convertirlos a <br />
        if (typeof field.value === 'string' && field.value.includes('\n')) {
          return (
            <>
              {field.value.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </>
          )
        }
        return String(field.value)
    }
  }

  // Formatear el total
  const formattedTotal = `S/ ${totalAmount.toLocaleString('es-PE')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${twoColumns ? 'sm:max-w-[900px]' : 'sm:max-w-[600px]'} max-h-[80vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>

        {twoColumns ? (
          <div className="flex flex-1 gap-6 overflow-hidden">
            {/* Columna izquierda */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{leftColumnTitle}</h3>
              <div className="space-y-4">
                {leftColumnFields.map((field, index) => (
                  <div key={index}>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="font-medium text-sm text-muted-foreground">{field.label}:</div>
                      <div className="col-span-2 text-sm">{formatValue(field)}</div>
                    </div>
                    {index < leftColumnFields.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>

            {/* Separador vertical */}
            <Separator orientation="vertical" className="h-auto" />

            {/* Columna derecha */}
            <div className="flex-1 space-y-4 overflow-y-auto pl-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{rightColumnTitle}</h3>
              <div className="space-y-4">
                {rightColumnFields.map((field, index) => (
                  <div key={index}>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="font-medium text-sm text-muted-foreground">{field.label}:</div>
                      <div className="col-span-2 text-sm">{formatValue(field)}</div>
                    </div>
                    {index < rightColumnFields.length - 1 && <Separator />}
                  </div>
                ))}
              </div>

              {/* Mostrar el total si está habilitado */}
              {showTotal && (
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 py-2">
                    <div className="font-bold text-base">TOTAL:</div>
                    <div className="col-span-2 font-bold text-base">{formattedTotal}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {fields?.map((field, index) => (
              <div key={index}>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="font-medium text-sm text-muted-foreground">{field.label}:</div>
                  <div className="col-span-2 text-sm">{formatValue(field)}</div>
                </div>
                {index < (fields?.length || 0) - 1 && <Separator />}
              </div>
            ))}
            {!fields?.length && <div className="text-center text-muted-foreground">No hay datos disponibles</div>}
            
            {/* Mostrar el total si está habilitado */}
            {showTotal && (
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="font-bold text-base">TOTAL:</div>
                  <div className="col-span-2 font-bold text-base">{formattedTotal}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
