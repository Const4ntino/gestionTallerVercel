"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MetodoPago } from "@/types/facturas"

interface QrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  metodoPago: MetodoPago
}

export function QrDialog({ open, onOpenChange, metodoPago }: QrDialogProps) {
  // Determinar qué imagen mostrar según el método de pago
  const getQrImage = () => {
    switch (metodoPago) {
      case MetodoPago.YAPE:
        return "/img/qr/qr-yape.png"
      case MetodoPago.PLIN:
        return "/img/qr/qr-plin.jpg"
      case MetodoPago.TRANSFERENCIA:
      case MetodoPago.DEPOSITO:
        return "/img/qr/nro-cuenta.png"
      default:
        return null
    }
  }

  const getDialogTitle = () => {
    switch (metodoPago) {
      case MetodoPago.YAPE:
        return "Código QR para Yape"
      case MetodoPago.PLIN:
        return "Código QR para Plin"
      case MetodoPago.TRANSFERENCIA:
        return "Datos para Transferencia"
      case MetodoPago.DEPOSITO:
        return "Datos para Depósito"
      default:
        return "Información de Pago"
    }
  }

  const qrImage = getQrImage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        {qrImage && (
          <div className="flex justify-center p-4">
            <div className="relative w-full max-w-[300px] h-[300px]">
              <Image
                src={qrImage}
                alt={`QR para ${metodoPago}`}
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
