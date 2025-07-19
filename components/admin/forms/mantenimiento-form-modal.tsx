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
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Check, ChevronsUpDown, RefreshCw } from "lucide-react"
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
  const [selectedVehiculo, setSelectedVehiculo] = useState<VehiculoResponse | null>(null)
  const [talleres, setTalleres] = useState<TallerResponse[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [productosUsados, setProductosUsados] = useState<
    Array<{ productoId: number; cantidadUsada: number; precioEnUso: number; subtotal: number }>
  >([])
  const [cantidadesOriginales, setCantidadesOriginales] = useState<Record<number, number>>({})
  const [vehiculoSearch, setVehiculoSearch] = useState("")
  const [openVehiculoCombobox, setOpenVehiculoCombobox] = useState(false)
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [searchServicio, setSearchServicio] = useState("")
  const [openServicioCombobox, setOpenServicioCombobox] = useState(false)
  const [searchProducto, setSearchProducto] = useState("")
  const [openProductoCombobox, setOpenProductoCombobox] = useState<number>(-1)
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
    if (selectedServicioId && servicios.length > 0) {
      const servicio = servicios.find((s) => s.id === selectedServicioId)
      if (servicio?.taller?.id) {
        // Asegurarnos de cargar los productos del taller correcto
        console.log(`Cargando productos para taller ID: ${servicio.taller.id} del servicio seleccionado`)
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
  }, [selectedServicioId, servicios, productosUsados.length])

  useEffect(() => {
    if (mantenimiento) {
      // Guardar el vehículo seleccionado para mostrarlo en el combobox
      setSelectedVehiculo(mantenimiento.vehiculo)
      
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
        subtotal: p.precioEnUso * p.cantidadUsada,
      }))
      
      // Guardar las cantidades originales para cada producto
      const cantidadesInicial: Record<number, number> = {}
      mantenimiento.productosUsados.forEach((p) => {
        cantidadesInicial[p.producto.id] = p.cantidadUsada
      })
      setCantidadesOriginales(cantidadesInicial)
      
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
        vehiculosApi.filter("", "ACTIVO", true), // Excluir vehículos en mantenimientos activos
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
            subtotal: p.cantidadUsada * p.precioEnUso,
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
      console.log(`Productos cargados para taller ID ${tallerId}:`, productosData.length)
      // Asegurarnos de que el estado se actualice correctamente
      setProductos(productosData)
    } catch (error) {
      toast.error("Error al cargar productos del taller")
      console.error("Error al cargar productos:", error)
    } finally {
      setLoadingProductos(false)
    }
  }

  const searchVehiculos = async (search: string) => {
    try {
      // Si estamos en modo edición y ya tenemos un vehículo seleccionado, no hacemos nada
      if (mantenimiento) {
        return
      }
      
      // Filtramos vehículos activos y que no estén en mantenimientos con estados SOLICITADO, EN_PROCESO o PENDIENTE
      const response = await vehiculosApi.filter(search, "ACTIVO", true)
      setVehiculos(response.content || [])
    } catch (error) {
      console.error("Error al buscar vehículos:", error)
    }
  }

  const agregarProducto = (productoId?: number) => {
    // Solo permitir agregar productos si hay un servicio seleccionado
    if (!selectedServicioId) {
      toast.error("Debes seleccionar un servicio antes de agregar productos")
      return
    }
    
    // Si se proporciona un productoId, verificar que no esté duplicado
    if (productoId) {
      // Verificar si el producto ya existe en la lista
      const productoExistente = productosUsados.find(p => p.productoId === productoId)
      if (productoExistente) {
        toast.error("Este producto ya ha sido agregado")
        return
      }
      
      // Buscar el producto seleccionado para obtener su precio
      const productoSeleccionado = productos.find(p => p.id === productoId)
      if (productoSeleccionado) {
        const nuevoProducto = { 
          productoId, 
          cantidadUsada: 1, 
          precioEnUso: productoSeleccionado.precio || 0, 
          subtotal: productoSeleccionado.precio || 0 
        }
        const nuevosProductos = [...productosUsados, nuevoProducto]
        setProductosUsados(nuevosProductos)
        setValue("productosUsados", nuevosProductos)
        return
      }
    }
    
    // Si no se proporciona un productoId o no se encuentra el producto, agregar uno vacío
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
      const productoSeleccionado = productos.find((p) => p.id === valor)
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
        productosUsados: productosUsados
          .filter((p) => p.productoId > 0)
          .map((p) => ({
            productoId: p.productoId,
            cantidadUsada: p.cantidadUsada,
            precioEnUso: p.precioEnUso,
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

  // Actualizar selectedVehiculo si no está en modo edición y cambia el ID seleccionado
  useEffect(() => {
    if (!mantenimiento && selectedVehiculoId) {
      const vehiculo = vehiculos.find((v) => v.id === selectedVehiculoId)
      if (vehiculo) {
        setSelectedVehiculo(vehiculo)
      }
    }
  }, [selectedVehiculoId, vehiculos, mantenimiento])
  
  const selectedTaller = talleres.find((t) => t.id === selectedTallerId)
  const selectedServicio = servicios.find((s) => s.id === selectedServicioId)
  
  // Calcular el total general (productos + servicio)
  const totalProductos = productosUsados.reduce((total, p) => total + p.subtotal, 0)
  
  // Asegurarnos de obtener el precio del servicio seleccionado
  const [precioServicio, setPrecioServicio] = useState<number>(0)
  
  // Actualizar el precio del servicio cuando cambia el servicio seleccionado o la lista de servicios
  useEffect(() => {
    if (selectedServicioId && servicios.length > 0) {
      const servicio = servicios.find(s => s.id === selectedServicioId)
      if (servicio) {
        console.log(`Actualizando precio del servicio: ${servicio.nombre} - ${servicio.precioBase}`)
        setPrecioServicio(servicio.precioBase || 0)
      } else {
        setPrecioServicio(0)
      }
    } else {
      setPrecioServicio(0)
    }
  }, [selectedServicioId, servicios])
  
  const totalGeneral = totalProductos + precioServicio

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{mantenimiento ? "Editar Mantenimiento" : "Crear Nuevo Mantenimiento"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Completa los datos para {mantenimiento ? "actualizar" : "crear"} un mantenimiento.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          {/* Contenido principal con layout horizontal */}
          <div className="flex flex-1 gap-6 overflow-hidden">
            {/* SECCIÓN DE DATOS - Lado izquierdo */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Datos del Mantenimiento</h3>

              {/* Taller y Servicio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tallerId">Taller</Label>
                  <Select
                    value={watch("tallerId")?.toString() || "0"}
                    onValueChange={(value) => {
                      const tallerId = Number.parseInt(value)
                      console.log(`Cambiando taller a ID: ${tallerId}`)
                      setValue("tallerId", tallerId)
                      setValue("servicioId", 0)
                      // Limpiar productos y productos usados al cambiar de taller
                      setProductos([])
                      setProductosUsados([])
                      setValue("productosUsados", [])
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
                  {errors.tallerId && <p className="text-sm text-red-500">{errors.tallerId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicioId">Servicio</Label>
                  <Popover
                    open={openServicioCombobox}
                    onOpenChange={(open) => {
                      setOpenServicioCombobox(open)
                      if (!open) setSearchServicio("")
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openServicioCombobox}
                        className="w-full justify-between bg-transparent"
                        disabled={!watch("tallerId") || loadingServicios}
                      >
                        <span className="truncate">
                          {watch("servicioId") && selectedServicio
                            ? `${selectedServicio.nombre} ${selectedServicio.precioBase ? `- S/ ${selectedServicio.precioBase.toFixed(2)}` : ""}`
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
                              .filter(
                                (servicio) =>
                                  searchServicio === "" ||
                                  servicio.nombre.toLowerCase().includes(searchServicio.toLowerCase()),
                              )
                              .map((servicio) => (
                                <CommandItem
                                  key={servicio.id}
                                  value={servicio.nombre}
                                  onSelect={() => {
                                    console.log(`Seleccionando servicio ID: ${servicio.id}, taller ID: ${servicio.taller?.id}`)
                                    setValue("servicioId", servicio.id)
                                    setOpenServicioCombobox(false)
                                    // Al seleccionar un servicio, los productos se cargarán en el useEffect
                                    // que observa selectedServicioId
                                    setProductosUsados([])
                                    setValue("productosUsados", [])
                                    setSearchServicio("")
                                    
                                    // Actualizar el precio del servicio inmediatamente
                                    console.log(`Actualizando precio del servicio directamente: ${servicio.nombre} - ${servicio.precioBase}`)
                                    setPrecioServicio(servicio.precioBase || 0)
                                    
                                    // Forzar la carga de productos inmediatamente si tenemos el taller del servicio
                                    if (servicio.taller?.id) {
                                      loadProductosByTaller(servicio.taller.id)
                                    }
                                  }}
                                  className="flex items-center justify-between px-3 py-2"
                                >
                                  <div className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0",
                                        servicio.id === watch("servicioId") ? "opacity-100" : "opacity-0",
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
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.servicioId && <p className="text-sm text-red-500">{errors.servicioId.message}</p>}
                </div>
              </div>

              {/* Vehículo */}
              <div className="space-y-2">
                <Label htmlFor="vehiculoId">
                  Vehículo
                  {mantenimiento && (
                    <span className="text-sm text-muted-foreground ml-2">(No editable)</span>
                  )}
                </Label>
                <Popover 
                  open={mantenimiento ? false : openVehiculoCombobox} 
                  onOpenChange={mantenimiento ? () => {} : setOpenVehiculoCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openVehiculoCombobox}
                      className={cn(
                        "w-full justify-between",
                        mantenimiento ? "bg-muted cursor-not-allowed" : "bg-transparent"
                      )}
                      disabled={!!mantenimiento}
                    >
                      {selectedVehiculo
                        ? `${selectedVehiculo.placa} - ${selectedVehiculo.marca} ${selectedVehiculo.modelo}`
                        : "Selecciona un vehículo..."}
                      {!mantenimiento && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
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
                                setSelectedVehiculo(vehiculo)
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

              {/* Trabajador y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trabajadorId">Trabajador (Opcional)</Label>
                  <Select
                    value={watch("trabajadorId")?.toString() || "0"}
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

                <div className="space-y-2">
                  <Label htmlFor="estado">
                    Estado
                    {mantenimiento?.estado === "COMPLETADO" && (
                      <span className="text-sm text-muted-foreground ml-2">(No editable)</span>
                    )}
                  </Label>
                  <Select
                    value={watch("estado") || mantenimiento?.estado || ""}
                    onValueChange={(value) => setValue("estado", value as MantenimientoEstado)}
                    disabled={mantenimiento?.estado === "COMPLETADO"}
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

              {/* Observaciones */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observacionesCliente">Observaciones del Cliente</Label>
                  <Textarea
                    {...register("observacionesCliente")}
                    placeholder="Observaciones o comentarios del cliente"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacionesTrabajador">Observaciones del Trabajador</Label>
                  <Textarea
                    {...register("observacionesTrabajador")}
                    placeholder="Observaciones del trabajador"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* SEPARADOR VERTICAL */}
            <Separator orientation="vertical" className="h-auto" />

            {/* SECCIÓN DE PRODUCTOS - Lado derecho */}
            <div className="flex-1 space-y-4 overflow-y-auto pl-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Productos Utilizados</h3>
              
              {/* Selector de productos - Searchable Combobox */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Agregar Producto</Label>
                </div>
                <Popover
                  open={openProductoCombobox === -2} // Usamos -2 para el selector principal
                  onOpenChange={(open) => {
                    setOpenProductoCombobox(open ? -2 : -1)
                    if (!open) setSearchProducto("")
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProductoCombobox === -2}
                      className="w-full justify-between h-9 bg-transparent"
                      disabled={!selectedServicioId || loadingProductos}
                    >
                      <span className="truncate">
                        {loadingProductos
                          ? "Cargando productos..."
                          : !selectedServicioId
                            ? "Selecciona un servicio primero"
                            : "Selecciona un producto para agregar"}
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
                              .filter(
                                (prod) =>
                                  // Filtrar por texto de búsqueda
                                  (searchProducto === "" ||
                                    prod.nombre.toLowerCase().includes(searchProducto.toLowerCase())) &&
                                  // Solo mostrar productos con stock
                                  prod.stock > 0 &&
                                  // No mostrar productos que ya están en la lista
                                  !productosUsados.some(p => p.productoId === prod.id)
                              )
                              .map((prod) => (
                                <CommandItem
                                  key={prod.id}
                                  value={prod.nombre}
                                  onSelect={() => {
                                    agregarProducto(prod.id)
                                    setOpenProductoCombobox(-1)
                                  }}
                                  className="flex items-center justify-between px-3 py-2"
                                >
                                  <div className="flex items-center">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{prod.nombre}</span>
                                      <span
                                        className={cn(
                                          "text-xs",
                                          prod.stock <= 5
                                            ? "text-amber-500 font-medium"
                                            : "text-muted-foreground",
                                        )}
                                      >
                                        Stock: {prod.stock} {prod.stock <= 5 && "(¡Bajo!)"}
                                      </span>
                                    </div>
                                  </div>
                                  {prod.precio !== undefined && (
                                    <span className="ml-4 whitespace-nowrap text-sm font-medium">
                                      S/
                                      {Number(prod.precio).toLocaleString("es-PE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
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
              </div>
              
              {/* Tabla de productos */}
              <div className="border rounded-md overflow-hidden">
                {productosUsados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-gray-50">
                    <p>No hay productos agregados</p>
                    <p className="text-sm">Selecciona un producto del menú desplegable para agregar</p>
                  </div>
                ) : (
                  <div>
                    {/* Encabezados de la tabla */}
                    <div className="grid grid-cols-12 gap-2 bg-gray-100 p-3 font-medium text-sm border-b">
                      <div className="col-span-5">Producto</div>
                      <div className="col-span-2 text-center">Cantidad</div>
                      <div className="col-span-2 text-right">Precio Unit.</div>
                      <div className="col-span-2 text-right">Subtotal</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    {/* Filas de la tabla */}
                    <div className="divide-y">
                      {productosUsados.map((producto, index) => {
                        const productoInfo = productos.find((p) => p.id === producto.productoId)
                        // En modo edición, permitir hasta la cantidad original + stock disponible
                        // Esto permite mantener la cantidad original o aumentarla si hay stock disponible
                        const isEditMode = !!mantenimiento
                        
                        // Asegurar que los valores son números válidos
                        const currentStock = productoInfo?.stock || 0
                        
                        // En modo edición, usar la cantidad original guardada al cargar el mantenimiento
                        // Esto evita que el límite máximo cambie cuando se modifica la cantidad en el spinner
                        const originalAmount = isEditMode && productoInfo ? (cantidadesOriginales[productoInfo.id] || 0) : 0
                        
                        // Calcular el máximo permitido
                        const maxStock = isEditMode
                          ? currentStock + originalAmount
                          : currentStock || 1
                          
                        // Verificación de seguridad para evitar valores infinitos o incorrectos
                        const safeMaxStock = isFinite(maxStock) && maxStock > 0 ? maxStock : 1
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-50">
                            {/* Nombre del producto */}
                            <div className="col-span-5">
                              {productoInfo ? (
                                <div>
                                  <div className="font-medium">{productoInfo.nombre}</div>
                                  <div className={cn(
                                    "text-xs",
                                    productoInfo.stock <= 5 ? "text-amber-500" : "text-muted-foreground"
                                  )}>
                                    {isEditMode ? (
                                      <>Stock disponible: {currentStock} + {originalAmount} (original) = {safeMaxStock} {currentStock <= 5 && "(¡Bajo!)"}</>
                                    ) : (
                                      <>Stock: {safeMaxStock} {safeMaxStock <= 5 && "(¡Bajo!)"}</>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">Selecciona un producto</span>
                              )}
                            </div>
                            
                            {/* Cantidad */}
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="1"
                                max={safeMaxStock}
                                value={producto.cantidadUsada}
                                onChange={(e) => {
                                  // Asegurar que el valor esté dentro de los límites permitidos
                                  let newValue = Number.parseInt(e.target.value) || 1
                                  
                                  // Aplicar límite estricto
                                  if (newValue > safeMaxStock) {
                                    newValue = safeMaxStock
                                  } else if (newValue < 1) {
                                    newValue = 1
                                  }
                                  
                                  // Solo actualizar si el valor es válido
                                  actualizarProducto(index, "cantidadUsada", newValue)
                                }}
                                className="h-8 text-center"
                              />
                            </div>
                            
                            {/* Precio unitario */}
                            <div className="col-span-2 text-right">
                              S/{Number(producto.precioEnUso).toLocaleString("es-PE", { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </div>
                            
                            {/* Subtotal */}
                            <div className="col-span-2 text-right font-medium">
                              S/{Number(producto.subtotal).toLocaleString("es-PE", { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </div>
                            
                            {/* Botón eliminar */}
                            <div className="col-span-1 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => eliminarProducto(index)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Total de productos */}
                    <div className="grid grid-cols-12 gap-2 p-3 border-t bg-gray-50 font-medium">
                      <div className="col-span-9 text-right">Total productos:</div>
                      <div className="col-span-2 text-right">
                        S/{totalProductos.toLocaleString("es-PE", { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </div>
                      <div className="col-span-1"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TOTAL GENERAL - Parte inferior */}
          <Separator className="my-4" />
          <div className="flex justify-between items-center pt-2">
            <div className="bg-gray-100 p-4 rounded-lg border shadow-sm w-full max-w-md">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Productos:</span>
                  <span>S/{totalProductos.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Servicio ({selectedServicio?.nombre || "No seleccionado"}):</span>
                  <span>S/{precioServicio.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span>S/{totalGeneral.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              {!mantenimiento && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    reset({
                      estado: "SOLICITADO",
                      productosUsados: []
                    });
                    setProductosUsados([]);
                    setSelectedVehiculo(null);
                    setVehiculoSearch("");
                    setSearchServicio("");
                    setSearchProducto("");
                    toast.info("Formulario limpiado");
                  }}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : mantenimiento ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
