"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DetailField {
  label: string
  value: any
  type?: "text" | "badge" | "date" | "currency" | "custom"
  variant?: string
  render?: () => React.ReactNode
}

interface DetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: DetailField[]
}

export function DetailsModal({ open, onOpenChange, title, description, fields }: DetailsModalProps) {
  const renderValue = (field: DetailField) => {
    if (field.render) {
      return field.render()
    }

    switch (field.type) {
      case "badge":
        return <Badge variant={field.variant as any}>{field.value}</Badge>
      case "date":
        return field.value ? new Date(field.value).toLocaleDateString() : "No especificada"
      case "currency":
        return `$${Number(field.value).toFixed(2)}`
      default:
        return field.value || "No especificado"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index}>
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="font-medium text-sm text-muted-foreground">{field.label}:</div>
                <div className="col-span-2 text-sm">{renderValue(field)}</div>
              </div>
              {index < fields.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
