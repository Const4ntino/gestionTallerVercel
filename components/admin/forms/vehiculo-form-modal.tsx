"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { vehiculosAdminApi } from "@/lib/vehiculos-admin-api"
import type { VehiculoRequest, VehiculoResponse } from "@/types/vehiculos-admin"
import type { ClienteResponse } from "@/types/admin"

interface VehiculoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vehiculo?: VehiculoResponse | null
}

export function VehiculoFormModal({ isOpen, onClose, onSuccess, vehiculo }: VehiculoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingClientes, setIsSearchingClientes] = useState(false)
  const [clientes, setClientes] = useState<ClienteResponse[]>([])
  const [clienteSearch, setClienteSearch] = useState("")
  const [clienteOpen, setClienteOpen] = useState(false)

  const [formData, setFormData] = useState<VehiculoRequest>({
    clienteId: 0,
    placa: "",
    marca: "",
    modelo: "",
    anio: new Date().getFullYear(),
    motor: "",
    tipoVehiculo: "",
    estado: "ACTIVO",
  })

  const [selectedCliente, setSelectedCliente] = useState<ClienteResponse | null>(null)

  // Cargar datos del vehículo al editar
  useEffect(() => {
    if (vehiculo) {
      setFormData({
        clienteId: vehiculo.cliente.id,
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        motor: vehiculo.motor,
        tipoVehiculo: vehiculo.tipoVehiculo,
        estado: vehiculo.estado as "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO",
      })
      setSelectedCliente({
        id: vehiculo.cliente.id,
        usuario: vehiculo.cliente.usuario,
        telefono: "",
        direccion: "",
        tallerAsignado: vehiculo.cliente.tallerAsignado || {
          id: 0,
          nombre: "",
          ciudad: "",
          direccion: "",
          logoUrl: null,
          estado: "",
          fechaCreacion: "",
          fechaActualizacion: "",
        },
        fechaCreacion: "",
        fechaActualizacion: "",
      })
    } else {
      // Reset form for new vehicle
      setFormData({
        clienteId: 0,
        placa: "",
        marca: "",
        modelo: "",
        anio: new Date().getFullYear(),
        motor: "",
        tipoVehiculo: "",
        estado: "ACTIVO",
      })
      setSelectedCliente(null)
    }
  }, [vehiculo])

  // Buscar clientes
  const searchClientes = async (search: string) => {
    if (!search.trim()) {
      setClientes([])
      return
    }

    setIsSearchingClientes(true)
    try {
      const response = await vehiculosAdminApi.searchClientes(search)
      setClientes(response.content)
    } catch (error) {
      console.error("Error searching clientes:", error)
      toast.error("Error al buscar clientes")
    } finally {
      setIsSearchingClientes(false)
    }
  }

  // Manejar búsqueda de clientes con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clienteSearch) {
        searchClientes(clienteSearch)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [clienteSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clienteId || !formData.placa.trim()) {
      toast.error("Cliente y placa son requeridos")
      return
    }

    setIsLoading(true)
    try {
      if (vehiculo) {
        await vehiculosAdminApi.update(vehiculo.id, formData)
        toast.success("Vehículo actualizado exitosamente")
      } else {
        await vehiculosAdminApi.create(formData)
        toast.success("Vehículo creado exitosamente")
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving vehiculo:", error)
      toast.error(vehiculo ? "Error al actualizar vehículo" : "Error al crear vehículo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClienteSelect = (cliente: ClienteResponse) => {
    setSelectedCliente(cliente)
    setFormData((prev) => ({ ...prev, clienteId: cliente.id }))
    setClienteOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehiculo ? "Editar Vehículo" : "Crear Nuevo Vehículo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente Selector */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clienteOpen}
                  className="w-full justify-between bg-transparent"
                >
                  {selectedCliente ? selectedCliente.usuario.nombreCompleto : "Seleccionar cliente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar cliente..."
                    value={clienteSearch}
                    onValueChange={setClienteSearch}
                  />
                  <CommandList>
                    {isSearchingClientes ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Buscando...</span>
                      </div>
                    ) : clientes.length === 0 ? (
                      <CommandEmpty>
                        {clienteSearch ? "No se encontraron clientes." : "Escribe para buscar clientes."}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {clientes.map((cliente) => (
                          <CommandItem
                            key={cliente.id}
                            value={cliente.usuario.nombreCompleto}
                            onSelect={() => handleClienteSelect(cliente)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCliente?.id === cliente.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div>
                              <div className="font-medium">{cliente.usuario.nombreCompleto}</div>
                              <div className="text-sm text-muted-foreground">
                                {cliente.tallerAsignado?.nombre || "Sin taller asignado"}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placa */}
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => setFormData((prev) => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                placeholder="ABC-123"
                required
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO") =>
                  setFormData((prev) => ({ ...prev, estado: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData((prev) => ({ ...prev, marca: e.target.value }))}
                placeholder="Toyota"
              />
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData((prev) => ({ ...prev, modelo: e.target.value }))}
                placeholder="Corolla"
              />
            </div>

            {/* Año */}
            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.anio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    anio: Number.parseInt(e.target.value) || new Date().getFullYear(),
                  }))
                }
              />
            </div>

            {/* Motor */}
            <div className="space-y-2">
              <Label htmlFor="motor">Motor</Label>
              <Input
                id="motor"
                value={formData.motor}
                onChange={(e) => setFormData((prev) => ({ ...prev, motor: e.target.value }))}
                placeholder="1.8L"
              />
            </div>
          </div>

          {/* Tipo de Vehículo */}
          <div className="space-y-2">
            <Label htmlFor="tipoVehiculo">Tipo de Vehículo</Label>
            <Input
              id="tipoVehiculo"
              value={formData.tipoVehiculo}
              onChange={(e) => setFormData((prev) => ({ ...prev, tipoVehiculo: e.target.value }))}
              placeholder="Sedan, SUV, Hatchback, etc."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vehiculo ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
