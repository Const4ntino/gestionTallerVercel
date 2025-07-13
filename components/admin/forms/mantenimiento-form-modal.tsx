"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  mantenimientosApi,
  vehiculosApi,
  serviciosMantenimientoApi,
  trabajadoresMantenimientoApi,
  productosMantenimientoApi,
} from "@/lib/mantenimientos-api"
import type { MantenimientoResponse, MantenimientoEstado, VehiculoResponse } from "@/types/mantenimientos"

const mantenimientoSchema = z.object({
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  servicioId: z.number().min(1, "Debe seleccionar un servicio"),
  trabajadorId: z.number().optional(),
  estado: z.enum(["SOLICITADO", "PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO"]),
  observacionesCliente: z.string().optional(),
  observacionesTrabajador: z.string().optional(),
  productosUsados: z
    .array(
      z.object({
        productoId: z.number(),
        cantidadUsada: z.number().min(1),
        precioEnUso: z.number().min(0),
      }),
    )
    .optional(),
})

type MantenimientoFormData = z.infer<typeof mantenimientoSchema>

interface MantenimientoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantenimiento?: MantenimientoResponse | null
  onSuccess: () => void
}

export function MantenimientoFormModal({ open, onOpenChange, mantenimiento, onSuccess }: MantenimientoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [productosUsados, setProductosUsados] = useState<
    Array<{ productoId: number; cantidadUsada: number; precioEnUso: number }>
  >([])
  const [vehiculoSearch, setVehiculoSearch] = useState("")
  const [openVehiculoCombobox, setOpenVehiculoCombobox] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MantenimientoFormData>({
    resolver: zodResolver(mantenimientoSchema),
    defaultValues: {
      estado: "SOLICITADO",
      productosUsados: [],
    },
  })

  const selectedVehiculoId = watch("vehiculoId")

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  useEffect(() => {
    if (mantenimiento) {
      setValue("vehiculoId", mantenimiento.vehiculo.id)
      setValue("servicioId", mantenimiento.servicio.id)
      setValue("trabajadorId", mantenimiento.trabajador?.id)
      setValue("estado", mantenimiento.estado)
      setValue("observacionesCliente", mantenimiento.observacionesCliente || "")
      setValue("observacionesTrabajador", mantenimiento.observacionesTrabajador || "")

      const productosFormateados = mantenimiento.productosUsados.map((p) => ({
        productoId: p.producto.id,
        cantidadUsada: p.cantidadUsada,
        precioEnUso: p.precioEnUso,
      }))
      setProductosUsados(productosFormateados)
      setValue("productosUsados", productosFormateados)
    } else {
      reset({
        estado: "SOLICITADO",
        productosUsados: [],
      })
      setProductosUsados([])
    }
  }, [mantenimiento, setValue, reset])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [vehiculosData, serviciosData, trabajadoresData, productosData] = await Promise.all([
        vehiculosApi.filter("", "ACTIVO"),
        serviciosMantenimientoApi.getAll(),
        trabajadoresMantenimientoApi.getAll(),
        productosMantenimientoApi.getAll(),
      ])

      setVehiculos(vehiculosData.content || [])
      setServicios(serviciosData)
      setTrabajadores(trabajadoresData)
      setProductos(productosData)
    } catch (error) {
      toast.error("Error al cargar datos")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchVehiculos = async (search: string) => {
    try {
      const response = await vehiculosApi.filter(search, "ACTIVO")
      setVehiculos(response.content || [])
    } catch (error) {
      console.error("Error al buscar vehículos:", error)
    }
  }

  const agregarProducto = () => {
    const nuevosProductos = [...productosUsados, { productoId: 0, cantidadUsada: 1, precioEnUso: 0 }]
    setProductosUsados(nuevosProductos)
    setValue("productosUsados", nuevosProductos)
  }

  const eliminarProducto = (index: number) => {
    const nuevosProductos = productosUsados.filter((_, i) => i !== index)
    setProductosUsados(nuevosProductos)
    setValue("productosUsados", nuevosProductos)
  }

  const actualizarProducto = (index: number, campo: string, valor: any) => {
    const nuevosProductos = [...productosUsados]
    nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor }
    setProductosUsados(nuevosProductos)
    setValue("productosUsados", nuevosProductos)
  }

  const onSubmit = async (data: MantenimientoFormData) => {
    try {
      setIsLoading(true)

      const payload = {
        vehiculoId: data.vehiculoId,
        servicioId: data.servicioId,
        trabajadorId: data.trabajadorId || null,
        estado: data.estado,
        observacionesCliente: data.observacionesCliente || "",
        observacionesTrabajador: data.observacionesTrabajador || "",
        productosUsados: productosUsados.filter((p) => p.productoId > 0),
      }

      if (mantenimiento) {
        await mantenimientosApi.update(mantenimiento.id, payload)
        toast.success("Mantenimiento actualizado correctamente")
      } else {
        await mantenimientosApi.create(payload)
        toast.success("Mantenimiento creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
      reset()
      setProductosUsados([])
    } catch (error) {
      toast.error("Error al guardar el mantenimiento")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedVehiculo = vehiculos.find((v) => v.id === selectedVehiculoId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mantenimiento ? "Editar Mantenimiento" : "Crear Nuevo Mantenimiento"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Completa los datos para {mantenimiento ? "actualizar" : "crear"} un mantenimiento.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehículo con búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="vehiculoId">Vehículo</Label>
              <Popover open={openVehiculoCombobox} onOpenChange={setOpenVehiculoCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openVehiculoCombobox}
                    className="w-full justify-between bg-transparent"
                  >
                    {selectedVehiculo
                      ? `${selectedVehiculo.placa} - ${selectedVehiculo.marca} ${selectedVehiculo.modelo}`
                      : "Selecciona un vehículo..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar vehículo por placa, marca o modelo..."
                      value={vehiculoSearch}
                      onValueChange={(value) => {
                        setVehiculoSearch(value)
                        searchVehiculos(value)
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>No se encontraron vehículos.</CommandEmpty>
                      <CommandGroup>
                        {vehiculos.map((vehiculo) => (
                          <CommandItem
                            key={vehiculo.id}
                            value={`${vehiculo.placa} ${vehiculo.marca} ${vehiculo.modelo}`}
                            onSelect={() => {
                              setValue("vehiculoId", vehiculo.id)
                              setOpenVehiculoCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedVehiculoId === vehiculo.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Cliente: {vehiculo.cliente.usuario.nombreCompleto}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.vehiculoId && <p className="text-sm text-red-500">{errors.vehiculoId.message}</p>}
            </div>

            {/* Servicio */}
            <div className="space-y-2">
              <Label htmlFor="servicioId">Servicio</Label>
              <Select
                value={watch("servicioId")?.toString() || "0"} // Updated default value to "0"
                onValueChange={(value) => setValue("servicioId", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((servicio) => (
                    <SelectItem key={servicio.id} value={servicio.id.toString()}>
                      {servicio.nombre} - {servicio.taller.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.servicioId && <p className="text-sm text-red-500">{errors.servicioId.message}</p>}
            </div>

            {/* Trabajador */}
            <div className="space-y-2">
              <Label htmlFor="trabajadorId">Trabajador (Opcional)</Label>
              <Select
                value={watch("trabajadorId")?.toString() || "0"} // Updated default value to "0"
                onValueChange={(value) => setValue("trabajadorId", value ? Number.parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin asignar</SelectItem> // Updated value to "0"
                  {trabajadores.map((trabajador) => (
                    <SelectItem key={trabajador.id} value={trabajador.id.toString()}>
                      {trabajador.usuario.nombreCompleto} - {trabajador.especialidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={watch("estado")}
                onValueChange={(value) => setValue("estado", value as MantenimientoEstado)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOLICITADO">SOLICITADO</SelectItem>
                  <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                  <SelectItem value="EN_PROCESO">EN_PROCESO</SelectItem>
                  <SelectItem value="COMPLETADO">COMPLETADO</SelectItem>
                  <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && <p className="text-sm text-red-500">{errors.estado.message}</p>}
            </div>
          </div>

          {/* Observaciones del Cliente */}
          <div className="space-y-2">
            <Label htmlFor="observacionesCliente">Observaciones del Cliente</Label>
            <Textarea
              {...register("observacionesCliente")}
              placeholder="Observaciones o comentarios del cliente"
              rows={3}
            />
          </div>

          {/* Observaciones del Trabajador */}
          <div className="space-y-2">
            <Label htmlFor="observacionesTrabajador">Observaciones del Trabajador</Label>
            <Textarea
              {...register("observacionesTrabajador")}
              placeholder="Observaciones técnicas del trabajador"
              rows={3}
            />
          </div>

          {/* Productos Usados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Productos Usados</Label>
              <Button type="button" variant="outline" size="sm" onClick={agregarProducto}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            {productosUsados.map((producto, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <Select
                    value={producto.productoId.toString()}
                    onValueChange={(value) => actualizarProducto(index, "productoId", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id.toString()}>
                          {prod.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={producto.cantidadUsada}
                    onChange={(e) => actualizarProducto(index, "cantidadUsada", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Precio</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={producto.precioEnUso}
                    onChange={(e) => actualizarProducto(index, "precioEnUso", Number.parseFloat(e.target.value))}
                  />
                </div>

                <div className="flex items-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => eliminarProducto(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : mantenimiento ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
