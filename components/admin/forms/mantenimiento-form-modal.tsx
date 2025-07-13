"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { mantenimientosApi } from "@/lib/mantenimientos-api"
import {
  type VehiculoResponse,
  type ServicioResponse,
  type TrabajadorResponse,
  type ProductoResponse,
  type MantenimientoRequest,
  MantenimientoEstado,
} from "@/types/mantenimientos"
import { PlusCircle, MinusCircle } from "lucide-react"
import { adminApi } from "@/lib/admin-api"
import { serviciosApi } from "@/lib/servicios-api"
import { productosApi } from "@/lib/productos-api"

interface MantenimientoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mantenimiento?: MantenimientoRequest & { id?: number }
}

const formSchema = z.object({
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  servicioId: z.number().min(1, "Debe seleccionar un servicio"),
  trabajadorId: z.number().nullable().optional(),
  estado: z.nativeEnum(MantenimientoEstado, { message: "Debe seleccionar un estado" }),
  observacionesCliente: z.string().max(500, "Máximo 500 caracteres").nullable().optional(),
  observacionesTrabajador: z.string().max(500, "Máximo 500 caracteres").nullable().optional(),
  productosUsados: z
    .array(
      z.object({
        productoId: z.number().min(1, "Debe seleccionar un producto"),
        cantidadUsada: z.number().min(1, "La cantidad debe ser al menos 1"),
        precioEnUso: z.number().min(0.01, "El precio debe ser mayor a 0"),
      }),
    )
    .optional(),
})

export function MantenimientoFormModal({ isOpen, onClose, onSuccess, mantenimiento }: MantenimientoFormModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehiculoId: mantenimiento?.vehiculoId || undefined,
      servicioId: mantenimiento?.servicioId || undefined,
      trabajadorId: mantenimiento?.trabajadorId || null,
      estado: mantenimiento?.estado || "SOLICITADO",
      observacionesCliente: mantenimiento?.observacionesCliente || "",
      observacionesTrabajador: mantenimiento?.observacionesTrabajador || "",
      productosUsados: mantenimiento?.productosUsados || [],
    },
  })

  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [servicios, setServicios] = useState<ServicioResponse[]>([])
  const [trabajadores, setTrabajadores] = useState<TrabajadorResponse[]>([])
  const [productos, setProductos] = useState<ProductoResponse[]>([])

  useEffect(() => {
    if (isOpen) {
      form.reset({
        vehiculoId: mantenimiento?.vehiculoId || undefined,
        servicioId: mantenimiento?.servicioId || undefined,
        trabajadorId: mantenimiento?.trabajadorId || null,
        estado: mantenimiento?.estado || "SOLICITADO",
        observacionesCliente: mantenimiento?.observacionesCliente || "",
        observacionesTrabajador: mantenimiento?.observacionesTrabajador || "",
        productosUsados: mantenimiento?.productosUsados || [],
      })
      loadDependencies()
    }
  }, [isOpen, mantenimiento, form])

  const loadDependencies = async () => {
    try {
      const [vehiculosData, serviciosData, trabajadoresData, productosData] = await Promise.all([
        adminApi.getVehiculos(),
        serviciosApi.getAll(),
        adminApi.getTrabajadores(),
        productosApi.getAll(),
      ])
      setVehiculos(vehiculosData)
      setServicios(serviciosData)
      setTrabajadores(trabajadoresData)
      setProductos(productosData)
    } catch (error) {
      toast.error("Error al cargar dependencias")
      console.error(error)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const dataToSend: MantenimientoRequest = {
        vehiculoId: values.vehiculoId,
        servicioId: values.servicioId,
        trabajadorId: values.trabajadorId,
        estado: values.estado,
        observacionesCliente: values.observacionesCliente || null,
        observacionesTrabajador: values.observacionesTrabajador || null,
        productosUsados: values.productosUsados || [],
      }

      if (mantenimiento?.id) {
        await mantenimientosApi.update(mantenimiento.id, dataToSend)
        toast.success("Mantenimiento actualizado exitosamente")
      } else {
        await mantenimientosApi.create(dataToSend)
        toast.success("Mantenimiento creado exitosamente")
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast.error("Error al guardar el mantenimiento")
      console.error(error)
    }
  }

  const addProducto = () => {
    const currentProductos = form.getValues("productosUsados") || []
    form.setValue("productosUsados", [...currentProductos, { productoId: 0, cantidadUsada: 1, precioEnUso: 0 }])
  }

  const removeProducto = (index: number) => {
    const currentProductos = form.getValues("productosUsados") || []
    form.setValue(
      "productosUsados",
      currentProductos.filter((_, i) => i !== index),
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mantenimiento ? "Editar Mantenimiento" : "Crear Nuevo Mantenimiento"}</DialogTitle>
          <DialogDescription>
            {mantenimiento
              ? "Edita los datos del mantenimiento existente."
              : "Completa los datos para crear un nuevo mantenimiento."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="vehiculoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehículo</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString() || "0"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un vehículo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehiculos.map((vehiculo) => (
                        <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                          {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} (
                          {vehiculo.cliente.usuario.nombreCompleto})
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
                  <FormLabel>Servicio</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString() || "0"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servicios.map((servicio) => (
                        <SelectItem key={servicio.id} value={servicio.id.toString()}>
                          {servicio.nombre} ({servicio.taller.nombre})
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
              name="trabajadorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trabajador (Opcional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "" ? null : Number(value))}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un trabajador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {trabajadores.map((trabajador) => (
                        <SelectItem key={trabajador.id} value={trabajador.id.toString()}>
                          {trabajador.usuario.nombreCompleto} ({trabajador.especialidad})
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
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "SOLICITADO"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MantenimientoEstado).map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado.replace(/_/g, " ")}
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
                  <FormLabel>Observaciones del Cliente</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones o comentarios del cliente"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacionesTrabajador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones del Trabajador</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones técnicas del trabajador"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-lg font-medium mb-2">Productos Usados</h3>
              {form.watch("productosUsados")?.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-end">
                  <FormField
                    control={form.control}
                    name={`productosUsados.${index}.productoId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Producto</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const selectedProduct = productos.find((p) => p.id === Number(value))
                            form.setValue(`productosUsados.${index}.precioEnUso`, selectedProduct?.precio || 0)
                            field.onChange(Number(value))
                          }}
                          value={field.value?.toString() || "0"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un producto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {productos.map((producto) => (
                              <SelectItem key={producto.id} value={producto.id.toString()}>
                                {producto.nombre} (${producto.precio.toFixed(2)})
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
                    name={`productosUsados.${index}.cantidadUsada`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`productosUsados.${index}.precioEnUso`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio en Uso</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeProducto(index)}>
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addProducto} className="mt-2 bg-transparent">
                <PlusCircle className="h-4 w-4 mr-2" /> Agregar Producto
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
