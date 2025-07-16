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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import {
  crearMantenimiento,
  obtenerMisVehiculosParaMantenimiento,
  obtenerServiciosDisponibles,
} from "@/lib/mantenimientos-cliente-api"
import type { MantenimientoRequestCliente } from "@/types/mantenimientos-cliente"
import type { VehiculoResponse } from "@/types/vehiculos"
import type { ServicioResponse } from "@/types/servicios"

const mantenimientoSchema = z.object({
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  servicioId: z.number().min(1, "Debe seleccionar un servicio"),
  observacionesCliente: z.string().optional(),
  estado: z.literal("SOLICITADO"),
})

interface MantenimientoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MantenimientoFormModal({ open, onOpenChange, onSuccess }: MantenimientoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [servicios, setServicios] = useState<ServicioResponse[]>([])
  const [loadingVehiculos, setLoadingVehiculos] = useState(false)
  const [loadingServicios, setLoadingServicios] = useState(false)

  const form = useForm<MantenimientoRequestCliente>({
    resolver: zodResolver(mantenimientoSchema),
    defaultValues: {
      vehiculoId: 0,
      servicioId: 0,
      observacionesCliente: "",
      estado: "SOLICITADO",
    },
  })

  useEffect(() => {
    if (open) {
      cargarVehiculos()
      cargarServicios()
    }
  }, [open])

  const cargarVehiculos = async () => {
    setLoadingVehiculos(true)
    try {
      const data = await obtenerMisVehiculosParaMantenimiento()
      setVehiculos(data)
    } catch (error) {
      toast.error("Error al cargar vehículos")
      console.error(error)
    } finally {
      setLoadingVehiculos(false)
    }
  }

  const cargarServicios = async () => {
    setLoadingServicios(true)
    try {
      const data = await obtenerServiciosDisponibles()
      setServicios(data)
    } catch (error) {
      toast.error("Error al cargar servicios")
      console.error(error)
    } finally {
      setLoadingServicios(false)
    }
  }

  const onSubmit = async (data: MantenimientoRequestCliente) => {
    setIsLoading(true)
    try {
      await crearMantenimiento(data)
      toast.success("Solicitud de mantenimiento creada correctamente")
      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error("Error al crear solicitud de mantenimiento")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Solicitar Mantenimiento</DialogTitle>
          <DialogDescription>
            Completa los datos para solicitar un nuevo mantenimiento para tu vehículo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vehiculoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehículo *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number.parseInt(value))} disabled={loadingVehiculos}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={loadingVehiculos ? "Cargando vehículos..." : "Selecciona tu vehículo"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehiculos.map((vehiculo) => (
                        <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                          {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servicioId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number.parseInt(value))} disabled={loadingServicios}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={loadingServicios ? "Cargando servicios..." : "Selecciona el servicio"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servicios.map((servicio) => (
                        <SelectItem key={servicio.id} value={servicio.id.toString()}>
                          {servicio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacionesCliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el problema o solicitud específica..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Solicitar Mantenimiento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
