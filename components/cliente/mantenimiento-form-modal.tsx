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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  crearMantenimiento,
  obtenerMisVehiculosParaMantenimiento,
  obtenerServiciosDisponibles,
  obtenerTalleresDisponibles,
} from "@/lib/mantenimientos-cliente-api"
import type { MantenimientoRequestCliente, TallerResponse } from "@/types/mantenimientos-cliente"
import type { VehiculoResponse } from "@/types/vehiculos"
import type { ServicioResponse } from "@/types/servicios"

const mantenimientoSchema = z.object({
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  tallerId: z.number().min(1, "Debe seleccionar un taller"),
  servicioId: z.number().min(1, "Debe seleccionar un servicio"),
  observacionesCliente: z.string().optional(),
  estado: z.literal("SOLICITADO"),
})

type FormData = z.infer<typeof mantenimientoSchema>

interface MantenimientoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MantenimientoFormModal({ open, onOpenChange, onSuccess }: MantenimientoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [servicios, setServicios] = useState<ServicioResponse[]>([])
  const [loadingVehiculos, setLoadingVehiculos] = useState(false)
  const [loadingTalleres, setLoadingTalleres] = useState(false)
  const [loadingServicios, setLoadingServicios] = useState(false)
  const [selectedTallerId, setSelectedTallerId] = useState<number | null>(null)

  // Estados para los combobox searchable
  const [openVehiculoCombobox, setOpenVehiculoCombobox] = useState(false)
  const [openTallerCombobox, setOpenTallerCombobox] = useState(false)
  const [openServicioCombobox, setOpenServicioCombobox] = useState(false)
  const [searchVehiculo, setSearchVehiculo] = useState("")
  const [searchTaller, setSearchTaller] = useState("")
  const [searchServicio, setSearchServicio] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(mantenimientoSchema),
    defaultValues: {
      vehiculoId: 0,
      tallerId: 0,
      servicioId: 0,
      observacionesCliente: "",
      estado: "SOLICITADO",
    },
  })

  useEffect(() => {
    if (open) {
      cargarVehiculos()
      cargarTalleres()
      form.reset()
      setSelectedTallerId(null)
      setServicios([])
    }
  }, [open, form])

  useEffect(() => {
    if (selectedTallerId) {
      cargarServicios(selectedTallerId)
      // Reset service selection when taller changes
      form.setValue("servicioId", 0)
    } else {
      setServicios([])
    }
  }, [selectedTallerId, form])

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

  const cargarTalleres = async () => {
    setLoadingTalleres(true)
    try {
      const data = await obtenerTalleresDisponibles()
      console.log("Talleres cargados:", JSON.stringify(data, null, 2))
      setTalleres(data)
    } catch (error) {
      toast.error("Error al cargar talleres")
      console.error(error)
    } finally {
      setLoadingTalleres(false)
    }
  }

  const cargarServicios = async (tallerId: number) => {
    setLoadingServicios(true)
    try {
      const data = await obtenerServiciosDisponibles(tallerId)
      setServicios(data)
    } catch (error) {
      toast.error("Error al cargar servicios")
      console.error(error)
    } finally {
      setLoadingServicios(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // Remove tallerId from the request as it's not part of the API
      const { tallerId, ...requestData } = data
      await crearMantenimiento(requestData as MantenimientoRequestCliente)
      toast.success("Solicitud de mantenimiento creada correctamente")
      onSuccess()
      onOpenChange(false)
      form.reset()
      setSelectedTallerId(null)
      setServicios([])
    } catch (error) {
      toast.error("Error al crear solicitud de mantenimiento")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
                <FormItem className="flex flex-col">
                  <FormLabel>Vehículo *</FormLabel>
                  <Popover
                    open={openVehiculoCombobox}
                    onOpenChange={(open) => {
                      setOpenVehiculoCombobox(open)
                      if (!open) setSearchVehiculo("")
                    }}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openVehiculoCombobox}
                          className="w-full justify-between bg-transparent"
                          disabled={loadingVehiculos}
                        >
                          <span className="truncate">
                            {field.value && vehiculos.find((v) => v.id === field.value)
                              ? `${vehiculos.find((v) => v.id === field.value)?.placa} - ${vehiculos.find((v) => v.id === field.value)?.marca} ${vehiculos.find((v) => v.id === field.value)?.modelo}`
                              : loadingVehiculos
                                ? "Cargando vehículos..."
                                : "Selecciona el vehículo"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar vehículo..."
                          value={searchVehiculo}
                          onValueChange={setSearchVehiculo}
                          className="h-9"
                        />
                        <CommandList className="max-h-[300px] overflow-auto">
                          <CommandEmpty>No se encontraron vehículos</CommandEmpty>
                          <CommandGroup>
                            {vehiculos
                              .filter(
                                (vehiculo) =>
                                  searchVehiculo === "" ||
                                  vehiculo.placa.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
                                  vehiculo.marca.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
                                  vehiculo.modelo.toLowerCase().includes(searchVehiculo.toLowerCase())
                              )
                              .map((vehiculo) => (
                                <CommandItem
                                  key={vehiculo.id}
                                  value={`${vehiculo.placa} ${vehiculo.marca} ${vehiculo.modelo}`}
                                  onSelect={() => {
                                    field.onChange(vehiculo.id)
                                    setOpenVehiculoCombobox(false)
                                    setSearchVehiculo("")
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === vehiculo.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tallerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Taller *</FormLabel>
                  <Popover
                    open={openTallerCombobox}
                    onOpenChange={(open) => {
                      setOpenTallerCombobox(open)
                      if (!open) setSearchTaller("")
                    }}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openTallerCombobox}
                          className="w-full justify-between bg-transparent"
                          disabled={loadingTalleres}
                        >
                          <span className="truncate">
                            {field.value && talleres.find((t) => t.id === field.value)
                              ? `${talleres.find((t) => t.id === field.value)?.nombre}`
                              : loadingTalleres
                                ? "Cargando talleres..."
                                : "Selecciona el taller"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar taller..."
                          value={searchTaller}
                          onValueChange={setSearchTaller}
                          className="h-9"
                        />
                        <CommandList className="max-h-[300px] overflow-auto">
                          <CommandEmpty>No se encontraron talleres</CommandEmpty>
                          <CommandGroup>
                            {talleres
                              .filter(
                                (taller) =>
                                  searchTaller === "" ||
                                  taller.nombre.toLowerCase().includes(searchTaller.toLowerCase()) ||
                                  taller.direccion.toLowerCase().includes(searchTaller.toLowerCase())
                              )
                              .map((taller) => (
                                <CommandItem
                                  className="py-2"  
                                  key={taller.id}
                                  value={taller.nombre}
                                  onSelect={() => {
                                    field.onChange(taller.id)
                                    setSelectedTallerId(taller.id)
                                    setOpenTallerCombobox(false)
                                    setSearchTaller("")
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === taller.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex justify-between w-full">
                                    <div className="flex-1 truncate">
                                      <span className="font-medium">{taller.nombre}</span>
                                      <span className="text-muted-foreground ml-1">({taller.ciudad})</span>
                                    </div>
                                    <div className="text-muted-foreground text-xs truncate ml-2 text-right">
                                      {taller.direccion}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servicioId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Servicio *</FormLabel>
                  <Popover
                    open={openServicioCombobox}
                    onOpenChange={(open) => {
                      setOpenServicioCombobox(open)
                      if (!open) setSearchServicio("")
                    }}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openServicioCombobox}
                          className="w-full justify-between bg-transparent"
                          disabled={loadingServicios || !selectedTallerId}
                        >
                          <span className="truncate">
                            {field.value && servicios.find((s) => s.id === field.value)
                              ? servicios.find((s) => s.id === field.value)?.nombre
                              : !selectedTallerId
                                ? "Primero selecciona un taller"
                                : loadingServicios
                                  ? "Cargando servicios..."
                                  : "Selecciona el servicio"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar servicio..."
                          value={searchServicio}
                          onValueChange={setSearchServicio}
                          className="h-9"
                        />
                        <CommandList className="max-h-[300px] overflow-auto">
                          <CommandEmpty>No se encontraron servicios</CommandEmpty>
                          <CommandGroup>
                            {servicios
                              .filter(
                                (servicio) =>
                                  searchServicio === "" ||
                                  servicio.nombre.toLowerCase().includes(searchServicio.toLowerCase())
                              )
                              .map((servicio) => (
                                <CommandItem
                                  className="py-2"
                                  key={servicio.id}
                                  value={servicio.nombre}
                                  onSelect={() => {
                                    field.onChange(servicio.id)
                                    setOpenServicioCombobox(false)
                                    setSearchServicio("")
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === servicio.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex justify-between w-full">
                                    <div className="flex-1 truncate">
                                      <span className="font-medium">{servicio.nombre}</span>
                                    </div>
                                    <div className="text-muted-foreground text-xs truncate ml-2 text-right">
                                      S/{servicio.precioBase.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
