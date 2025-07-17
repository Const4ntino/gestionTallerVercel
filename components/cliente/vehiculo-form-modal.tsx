"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { crearVehiculo, actualizarVehiculo } from "@/lib/vehiculos-api"
import type { VehiculoResponse, VehiculoClientRequest } from "@/types/vehiculos"

const vehiculoSchema = z.object({
  placa: z.string().min(1, "La placa es requerida"),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anio: z.number().optional(),
  motor: z.string().optional(),
  tipoVehiculo: z.string().optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
})

interface VehiculoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculo?: VehiculoResponse | null
  onSuccess: () => void
}

export function VehiculoFormModal({ open, onOpenChange, vehiculo, onSuccess }: VehiculoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!vehiculo

  const form = useForm<VehiculoClientRequest>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: "",
      marca: "",
      modelo: "",
      anio: undefined,
      motor: "",
      tipoVehiculo: "",
      estado: "ACTIVO",
    },
  })

  useEffect(() => {
    if (vehiculo) {
      form.reset({
        placa: vehiculo.placa,
        marca: vehiculo.marca || "",
        modelo: vehiculo.modelo || "",
        anio: vehiculo.anio || undefined,
        motor: vehiculo.motor || "",
        tipoVehiculo: vehiculo.tipoVehiculo || "",
        estado: vehiculo.estado,
      })
    } else {
      form.reset({
        placa: "",
        marca: "",
        modelo: "",
        anio: undefined,
        motor: "",
        tipoVehiculo: "",
        estado: "ACTIVO",
      })
    }
  }, [vehiculo, form])

  const onSubmit = async (data: VehiculoClientRequest) => {
    setIsLoading(true)
    try {
      if (isEditing && vehiculo) {
        await actualizarVehiculo(vehiculo.id, data)
        toast.success("Vehículo actualizado correctamente")
      } else {
        await crearVehiculo(data)
        toast.success("Vehículo registrado correctamente")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(isEditing ? "Error al actualizar vehículo" : "Error al registrar vehículo")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos de tu vehículo." : "Completa los datos para registrar tu vehículo."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="placa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa *</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Corolla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="anio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2023"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motor</FormLabel>
                    <FormControl>
                      <Input placeholder="1.8L" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tipoVehiculo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Vehículo</FormLabel>
                  <FormControl>
                    <Input placeholder="Sedan, SUV, Hatchback..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVO">Activo</SelectItem>
                      <SelectItem value="INACTIVO">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
