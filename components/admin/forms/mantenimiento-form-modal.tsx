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
import { talleresApi } from "@/lib/admin-api"
import type { MantenimientoResponse, MantenimientoEstado, VehiculoResponse } from "@/types/mantenimientos"
import type { TallerResponse } from "@/types/talleres"

const mantenimientoSchema = z.object({
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  tallerId: z.number().min(1, "Debe seleccionar un taller"),
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
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [productosUsados, setProductosUsados] = useState<
    Array<{ productoId: number; cantidadUsada: number; precioEnUso: number; subtotal: number }>
  >([])
  const [vehiculoSearch, setVehiculoSearch] = useState("")
  const [openVehiculoCombobox, setOpenVehiculoCombobox] = useState(false)
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [searchServicio, setSearchServicio] = useState("")
  const [openServicioCombobox, setOpenServicioCombobox] = useState(false)
  const [searchProducto, setSearchProducto] = useState("")
  const [openProductoCombobox, setOpenProductoCombobox] = useState<number>(-1) // Usar número para identificar qué producto está abierto
  const [loadingTalleres, setLoadingTalleres] = useState(false)
  const [loadingServicios, setLoadingServicios] = useState(false)

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
  const selectedServicioId = watch("servicioId")
  const selectedTallerId = watch("tallerId")

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  // Cargar servicios cuando cambia el taller seleccionado
  useEffect(() => {
    if (selectedTallerId) {
      loadServiciosByTaller(selectedTallerId)
    } else {
      // Limpiar servicios si no hay taller seleccionado
      setServicios([])
      setValue("servicioId", 0)
    }
  }, [selectedTallerId])

  // Cargar productos cuando cambia el servicio seleccionado
  useEffect(() => {
    if (selectedServicioId) {
      const servicio = servicios.find(s => s.id === selectedServicioId)
      if (servicio?.taller?.id) {
        loadProductosByTaller(servicio.taller.id)
      }
    } else {
      // Limpiar productos si no hay servicio seleccionado
      setProductos([])

      // Si hay productos usados, los limpiamos
      if (productosUsados.length > 0) {
        setProductosUsados([])
        setValue("productosUsados", [])
      }
    }
  }, [selectedServicioId, servicios])

  useEffect(() => {
    if (mantenimiento) {
      setValue("vehiculoId", mantenimiento.vehiculo.id)
      setValue("tallerId", mantenimiento.servicio.taller.id)
      setValue("servicioId", mantenimiento.servicio.id)
      setValue("trabajadorId", mantenimiento.trabajador?.id)
      setValue("estado", mantenimiento.estado)
      setValue("observacionesCliente", mantenimiento.observacionesCliente || "")
      setValue("observacionesTrabajador", mantenimiento.observacionesTrabajador || "")

      const productosFormateados = mantenimiento.productosUsados.map((p) => ({
        productoId: p.producto.id,
        cantidadUsada: p.cantidadUsada,
        precioEnUso: p.precioEnUso,
        subtotal: p.precioEnUso * p.cantidadUsada
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
      const [vehiculosData, trabajadoresData] = await Promise.all([
        vehiculosApi.filter("", "ACTIVO"),
        trabajadoresMantenimientoApi.getAll(),
      ])

      setVehiculos(vehiculosData.content || [])
      setTrabajadores(trabajadoresData)

      // Cargar talleres
      await loadTalleres()

      // Si estamos editando un mantenimiento, cargar los datos correspondientes
      if (mantenimiento) {
        setValue("vehiculoId", mantenimiento.vehiculo.id)
        setValue("tallerId", mantenimiento.servicio.taller.id)
        setValue("servicioId", mantenimiento.servicio.id)
        setValue("trabajadorId", mantenimiento.trabajador?.id)
        setValue("estado", mantenimiento.estado)
        setValue("observacionesCliente", mantenimiento.observacionesCliente || "")
        setValue("observacionesTrabajador", mantenimiento.observacionesTrabajador || "")

        // Cargar productos usados si los hay
        if (mantenimiento.productosUsados && mantenimiento.productosUsados.length > 0) {
          const productosFormateados = mantenimiento.productosUsados.map((p) => ({
            productoId: p.producto.id,
            cantidadUsada: p.cantidadUsada,
            precioEnUso: p.precioEnUso,
            subtotal: p.cantidadUsada * p.precioEnUso
          }))
          setProductosUsados(productosFormateados)
          setValue("productosUsados", productosFormateados)
        }
      }

    } catch (error) {
      toast.error("Error al cargar datos")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTalleres = async () => {
    try {
      setLoadingTalleres(true)
      const talleresData = await talleresApi.getAll()
      setTalleres(talleresData)
    } catch (error) {
      toast.error("Error al cargar talleres")
      console.error(error)
      setTalleres([])
    } finally {
      setLoadingTalleres(false)
    }
  }

  const loadServiciosByTaller = async (tallerId: number) => {
    try {
      setLoadingServicios(true)
      const serviciosData = await serviciosMantenimientoApi.getByTaller(tallerId)
      setServicios(serviciosData)

      // Si solo hay un servicio, lo seleccionamos automáticamente
      if (serviciosData.length === 1) {
        setValue("servicioId", serviciosData[0].id)
      } else {
        setValue("servicioId", 0)
      }

      // Limpiar productos al cambiar de taller
      setProductos([])
      setProductosUsados([])
      setValue("productosUsados", [])
      setValue("productosUsados", [])
    } catch (error) {
      toast.error("Error al cargar servicios del taller")
      console.error(error)
      setServicios([])
      setValue("servicioId", 0)
    } finally {
      setLoadingServicios(false)
    }
  }

  const loadProductosByTaller = async (tallerId: number) => {
    try {
      setLoadingProductos(true)
      const productosData = await productosMantenimientoApi.filterByTaller(tallerId)
      setProductos(productosData)
    } catch (error) {
      toast.error("Error al cargar productos del taller")
      console.error(error)
    } finally {
      setLoadingProductos(false)
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
    // Solo permitir agregar productos si hay un servicio seleccionado
    if (!selectedServicioId) {
      toast.error("Debes seleccionar un servicio antes de agregar productos")
      return
    }

    const nuevosProductos = [...productosUsados, { productoId: 0, cantidadUsada: 1, precioEnUso: 0, subtotal: 0 }]
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

    // Si se actualiza el producto o la cantidad, actualizar el precio y subtotal
    if (campo === "productoId") {
      const productoSeleccionado = productos.find(p => p.id === valor)
      if (productoSeleccionado?.precio) {
        nuevosProductos[index].precioEnUso = productoSeleccionado.precio
        nuevosProductos[index].subtotal = productoSeleccionado.precio * nuevosProductos[index].cantidadUsada
      } else {
        nuevosProductos[index].precioEnUso = 0
        nuevosProductos[index].subtotal = 0
      }
    } else if (campo === "cantidadUsada") {
      nuevosProductos[index].subtotal = nuevosProductos[index].precioEnUso * valor
    } else if (campo === "precioEnUso") {
      nuevosProductos[index].subtotal = valor * nuevosProductos[index].cantidadUsada
    }

    setProductosUsados(nuevosProductos)
    setValue("productosUsados", nuevosProductos)
  }

  const onSubmit = async (data: MantenimientoFormData) => {
    try {
      setIsLoading(true)

      const mantenimientoData = {
        ...data,
        vehiculoId: Number(data.vehiculoId),
        tallerId: Number(data.tallerId),
        servicioId: Number(data.servicioId),
        trabajadorId: data.trabajadorId ? Number(data.trabajadorId) : null,
        productosUsados: productosUsados.filter(p => p.productoId > 0).map(p => ({
          productoId: p.productoId,
          cantidadUsada: p.cantidadUsada,
          precioEnUso: p.precioEnUso
        })),
      }

      if (mantenimiento) {
        await mantenimientosApi.update(mantenimiento.id, mantenimientoData)
        toast.success("Mantenimiento actualizado correctamente")
      } else {
        await mantenimientosApi.create(mantenimientoData)
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
  const selectedTaller = talleres.find((t) => t.id === selectedTallerId)
  const selectedServicio = servicios.find((s) => s.id === selectedServicioId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mantenimiento ? "Editar Mantenimiento" : "Crear Nuevo Mantenimiento"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Completa los datos para {mantenimiento ? "actualizar" : "crear"} un mantenimiento.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Taller */}
            <div className="space-y-2">
              <Label htmlFor="tallerId">Taller</Label>
              <Select
                value={watch("tallerId")?.toString() || "0"}
                onValueChange={(value) => {
                  const tallerId = Number.parseInt(value);
                  setValue("tallerId", tallerId);
                  // Reset servicio y productos al cambiar de taller
                  setValue("servicioId", 0);
                  setProductos([]);
                  setProductosUsados([]);
                  setValue("productosUsados", []);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un taller" />
                </SelectTrigger>
                <SelectContent>
                  {talleres.map((taller) => (
                    <SelectItem key={taller.id} value={taller.id.toString()}>
                      {taller.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tallerId && (
                <p className="text-sm text-red-500">{errors.tallerId.message}</p>
              )}
            </div>

            {/* Servicio */}
            <div className="space-y-2">
              <Label htmlFor="servicioId">Servicio</Label>
              <Popover open={openServicioCombobox} onOpenChange={(open) => {
                setOpenServicioCombobox(open);
                if (!open) setSearchServicio("");
              }}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openServicioCombobox}
                    className="w-full justify-between"
                    disabled={!watch("tallerId") || loadingServicios}
                  >
                    <span className="truncate">
                      {watch("servicioId") && selectedServicio
                        ? `${selectedServicio.nombre} ${selectedServicio.precioBase ? `- S/ ${selectedServicio.precioBase.toFixed(2)}` : ''}`
                        : loadingServicios
                        ? "Cargando servicios..."
                        : !watch("tallerId")
                        ? "Selecciona un taller primero"
                        : "Selecciona un servicio"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar servicio por nombre..." 
                      value={searchServicio}
                      onValueChange={setSearchServicio}
                      className="h-9"
                    />
                    <CommandList className="max-h-[300px] overflow-auto">
                      <CommandEmpty>No se encontraron servicios</CommandEmpty>
                      <CommandGroup>
                        {servicios
                          .filter(servicio => 
                            searchServicio === '' || 
                            servicio.nombre.toLowerCase().includes(searchServicio.toLowerCase())
                          )
                          .map((servicio) => (
                            <CommandItem
                              key={servicio.id}
                              value={servicio.nombre}
                              onSelect={() => {
                                setValue("servicioId", servicio.id);
                                setOpenServicioCombobox(false);
                                // Limpiar productos al cambiar de servicio
                                setProductos([]);
                                setProductosUsados([]);
                                setValue("productosUsados", []);
                                setSearchServicio("");
                              }}
                              className="flex items-center justify-between px-3 py-2"
                            >
                              <div className="flex items-center">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 flex-shrink-0",
                                    servicio.id === watch("servicioId") ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="font-medium">{servicio.nombre}</span>
                              </div>
                              {servicio.precioBase !== undefined && (
                                <span className="ml-4 whitespace-nowrap text-sm text-muted-foreground">
                                  S/ {servicio.precioBase.toFixed(2)}
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        {servicios.length === 0 && (
                          <CommandItem className="text-muted-foreground" disabled>
                            {!watch("tallerId") 
                              ? "Selecciona un taller primero"
                              : "No hay servicios disponibles"}
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {errors.servicioId && <p className="text-sm text-red-500">{errors.servicioId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
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
                  <SelectItem value="0">Sin asignar</SelectItem>
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
              placeholder="Observaciones del trabajador"
              className="min-h-[100px]"
            />
          </div>

          {/* Sección de Productos */}
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Productos Utilizados</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarProducto}
                disabled={!selectedServicioId}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
            </div>
          </div>

          {productosUsados.map((producto, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Producto</Label>
                <Popover 
                  open={index === openProductoCombobox} 
                  onOpenChange={(open) => {
                    setOpenProductoCombobox(open ? index : -1);
                    if (!open) setSearchProducto("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={index === openProductoCombobox}
                      className="w-full justify-between h-9"
                      disabled={!selectedServicioId || loadingProductos}
                    >
                      <span className="truncate">
                        {producto.productoId > 0 && productos.find(p => p.id === producto.productoId)
                          ? `${productos.find(p => p.id === producto.productoId)?.nombre} ${productos.find(p => p.id === producto.productoId)?.precio ? `- S/${Number(productos.find(p => p.id === producto.productoId)?.precio).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : ''}`
                          : loadingProductos
                          ? "Cargando productos..."
                          : !selectedServicioId
                          ? "Selecciona un servicio primero"
                          : "Selecciona producto"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar producto por nombre..." 
                        value={searchProducto}
                        onValueChange={setSearchProducto}
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] overflow-auto">
                        <CommandEmpty>No se encontraron productos</CommandEmpty>
                        <CommandGroup>
                          {productos.length === 0 ? (
                            <CommandItem disabled>
                              {!selectedServicioId
                                ? "Selecciona un servicio primero"
                                : loadingProductos
                                  ? "Cargando productos..."
                                  : "No hay productos disponibles"}
                            </CommandItem>
                          ) : (
                            productos
                              .filter(prod => 
                                // Filtrar por nombre y por stock disponible
                                (searchProducto === '' || 
                                prod.nombre.toLowerCase().includes(searchProducto.toLowerCase())) &&
                                prod.stock > 0
                              )
                              .map((prod) => (
                                <CommandItem
                                  key={prod.id}
                                  value={prod.nombre}
                                  onSelect={() => {
                                    actualizarProducto(index, "productoId", prod.id);
                                    setOpenProductoCombobox(-1);
                                  }}
                                  className="flex items-center justify-between px-3 py-2"
                                >
                                  <div className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0",
                                        producto.productoId === prod.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{prod.nombre}</span>
                                      <span className={cn(
                                        "text-xs",
                                        prod.stock <= 5 ? "text-amber-500 font-medium" : "text-muted-foreground"
                                      )}>
                                        Stock disponible: {prod.stock} {prod.stock <= 5 && "(¡Bajo!)"}
                                      </span>
                                    </div>
                                  </div>
                                  {prod.precio !== undefined && (
                                    <span className="ml-4 whitespace-nowrap text-sm font-medium">
                                      S/{Number(prod.precio).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                  )}
                                </CommandItem>
                              ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {producto.productoId > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">
                      Precio: <span className="font-medium">S/{Number(producto.precioEnUso).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    {productos.find(p => p.id === producto.productoId)?.stock && (
                      <div className={cn(
                        "text-xs",
                        (productos.find(p => p.id === producto.productoId)?.stock || 0) <= 5 
                          ? "text-amber-500 font-medium" 
                          : "text-muted-foreground"
                      )}>
                        Stock disponible: {productos.find(p => p.id === producto.productoId)?.stock}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  max={producto.productoId > 0 ? productos.find(p => p.id === producto.productoId)?.stock || 1 : 1}
                  value={producto.cantidadUsada}
                  onChange={(e) => {
                    const newValue = Number.parseInt(e.target.value);
                    const maxStock = producto.productoId > 0 ? productos.find(p => p.id === producto.productoId)?.stock || 1 : 1;
                    // Limitar la cantidad al stock disponible
                    const limitedValue = Math.min(newValue, maxStock);
                    actualizarProducto(index, "cantidadUsada", limitedValue);
                  }}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label>Subtotal</Label>
                <Input
                  type="text"
                  value={`S/${Number(producto.subtotal).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  readOnly
                  className="bg-muted cursor-not-allowed h-9"
                />
              </div>

              <div className="flex items-end justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => eliminarProducto(index)}
                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

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
    </Dialog >
  )
}
