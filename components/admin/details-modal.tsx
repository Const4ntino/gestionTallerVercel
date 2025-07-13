"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  fields: DetailField[]
}

export function DetailsModal({ open, onOpenChange, title, description, fields }: DetailsModalProps) {
  const formatValue = (field: DetailField) => {
    if (!field.value || field.value === "null" || field.value === null) {
      return "N/A"
    }

    switch (field.type) {
      case "badge":
        return <Badge variant={field.variant || "default"}>{field.value}</Badge>
      case "date":
        if (typeof field.value === "string" && field.value.includes("T")) {
          // Format full datetime
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
      case "currency":
        return `$${Number(field.value).toFixed(2)}`
      default:
        return field.value.toString()
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
                <div className="col-span-2 text-sm">{formatValue(field)}</div>
              </div>
              {index < fields.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
