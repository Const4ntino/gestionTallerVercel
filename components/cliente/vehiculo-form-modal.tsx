"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { vehiculosApi } from "@/lib/vehiculos-api"
import type { VehiculoResponse, VehiculoClientRequest } from "@/types/vehiculos"
import { toast } from "sonner"

interface VehiculoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculo?: VehiculoResponse | null
  onSuccess: () => void
}

export function VehiculoFormModal({ open, onOpenChange, vehiculo, onSuccess }: VehiculoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<VehiculoClientRequest>({
    placa: "",
    marca: "",
    modelo: "",
    anio: new Date().getFullYear(),
    motor: "",
    tipoVehiculo: "",
    estado: "ACTIVO",
  })

  useEffect(() => {
    if (open) {
      if (vehiculo) {
        setFormData({
          placa: vehiculo.placa,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          anio: vehiculo.anio,
          motor: vehiculo.motor,
          tipoVehiculo: vehiculo.tipoVehiculo,
          estado: vehiculo.estado as "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO",
        })
      } else {
        setFormData({
          placa: "",
          marca: "",
          modelo: "",
          anio: new Date().getFullYear(),
          motor: "",
          tipoVehiculo: "",
          estado: "ACTIVO",
        })
      }
    }
  }, [open, vehiculo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (vehiculo) {
        await vehiculosApi.update(vehiculo.id, formData)
        toast.success("Vehículo actualizado correctamente")
      } else {
        await vehiculosApi.create(formData)
        toast.success("Vehículo registrado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar vehículo:", error)
      toast.error(vehiculo ? "Error al actualizar vehículo" : "Error al registrar vehículo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof VehiculoClientRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const tiposVehiculo = [
    "Sedan",
    "SUV",
    "Hatchback",
    "Pickup",
    "Coupe",
    "Convertible",
    "Wagon",
    "Van",
    "Camión",
    "Motocicleta",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{vehiculo ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}</DialogTitle>
          <DialogDescription>
            {vehiculo ? "Modifica los datos de tu vehículo." : "Completa los datos para registrar un nuevo vehículo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => handleChange("placa", e.target.value)}
                placeholder="ABC-123"
                required
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleChange("marca", e.target.value)}
                placeholder="Toyota"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleChange("modelo", e.target.value)}
                placeholder="Corolla"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                value={formData.anio}
                onChange={(e) => handleChange("anio", Number.parseInt(e.target.value))}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motor">Motor</Label>
              <Input
                id="motor"
                value={formData.motor}
                onChange={(e) => handleChange("motor", e.target.value)}
                placeholder="1.8L"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoVehiculo">Tipo de Vehículo</Label>
            <Select value={formData.tipoVehiculo} onValueChange={(value) => handleChange("tipoVehiculo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de vehículo" />
              </SelectTrigger>
              <SelectContent>
                {tiposVehiculo.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {vehiculo ? "Actualizando..." : "Registrando..."}
                </>
              ) : vehiculo ? (
                "Actualizar"
              ) : (
                "Registrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
