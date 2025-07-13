"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DetailField {
  label: string
  value: any
  type?: "text" | "badge" | "date" | "currency" | "list"
  variant?: "default" | "secondary" | "destructive" | "outline"
}

interface DetailsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: DetailField[]
}

export function DetailsModal({ isOpen, onClose, title, data }: DetailsModalProps) {
  const formatValue = (field: DetailField) => {
    if (field.value === null || field.value === undefined) {
      return "N/A"
    }

    switch (field.type) {
      case "badge":
        return <Badge variant={field.variant || "default"}>{field.value}</Badge>
      case "date":
        return new Date(field.value).toLocaleString()
      case "currency":
        return `$${Number(field.value).toFixed(2)}`
      case "list":
        if (Array.isArray(field.value)) {
          return field.value.join(", ")
        }
        return field.value
      default:
        return String(field.value)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {data.map((field, index) => (
            <div key={index}>
              <div className="flex justify-between items-start py-2">
                <span className="font-medium text-sm text-muted-foreground min-w-[120px]">{field.label}:</span>
                <div className="flex-1 text-right">{formatValue(field)}</div>
              </div>
              {index < data.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
