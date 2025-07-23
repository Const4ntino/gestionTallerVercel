"use client"

import { useState, useEffect } from "react"
import type { AlertaResponse, AlertasFiltros } from "@/types/alertas-cliente"
import { obtenerMisAlertas, marcarAlertaComoVista, marcarAlertaComoResuelta } from "@/lib/alertas-cliente-api"
import { obtenerVehiculosCliente } from "@/lib/vehiculos-api"
import type { VehiculoResponse } from "@/types/vehiculos"
import { AlertaCard } from "@/components/cliente/alerta-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Bell, BellOff } from "lucide-react"
import { toast } from "sonner"
import { useAlertas } from "@/contexts/alertas-context"

export default function AlertasPage() {
  const [activeTab, setActiveTab] = useState<string>("nuevas")
  const [alertas, setAlertas] = useState<AlertaResponse[]>([])
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [contadores, setContadores] = useState<{ nuevas: number; vistas: number }>({ nuevas: 0, vistas: 0 })
  const [filtros, setFiltros] = useState<AlertasFiltros>({
    estado: "NUEVA", // Por defecto mostrar nuevas
    page: 0,
    size: 10,
    sort: "fechaCreacion,desc",
  })
  const [totalElements, setTotalElements] = useState(0)
  const { actualizarContadorAlertas } = useAlertas()

  useEffect(() => {
    cargarVehiculos()
    // Cargar contadores iniciales
    cargarContadores()
  }, [])

  useEffect(() => {
    cargarAlertas()
  }, [filtros])

  const cargarVehiculos = async () => {
    try {
      const response = await obtenerVehiculosCliente({})
      setVehiculos(response.content)
    } catch (error) {
      console.error("Error al cargar vehículos:", error)
    }
  }

  // Función para cargar los contadores de alertas por estado
  const cargarContadores = async () => {
    try {
      // Cargar conteo de alertas nuevas
      const responseNuevas = await obtenerMisAlertas({
        estado: "NUEVA",
        page: 0,
        size: 1,
        sort: "fechaCreacion,desc"
      })
      
      // Cargar conteo de alertas vistas
      const responseVistas = await obtenerMisAlertas({
        estado: "VISTA",
        page: 0,
        size: 1,
        sort: "fechaCreacion,desc"
      })
      
      // Actualizar contadores
      setContadores({
        nuevas: responseNuevas.totalElements,
        vistas: responseVistas.totalElements
      })
    } catch (error) {
      console.error("Error al cargar contadores:", error)
    }
  }
  
  const cargarAlertas = async () => {
    try {
      setLoading(true)
      const response = await obtenerMisAlertas(filtros)
      setAlertas(response.content)
      setTotalElements(response.totalElements)
      
      // Actualizar el contador correspondiente al estado actual
      if (filtros.estado === "NUEVA") {
        setContadores(prev => ({ ...prev, nuevas: response.totalElements }))
      } else if (filtros.estado === "VISTA") {
        setContadores(prev => ({ ...prev, vistas: response.totalElements }))
      }
    } catch (error) {
      console.error("Error al cargar alertas:", error)
      toast.error("Error al cargar las alertas")
    } finally {
      setLoading(false)
    }
  }

  const marcarComoVista = async (alertaId: number) => {
    try {
      await marcarAlertaComoVista(alertaId)
      // Actualizar la lista de alertas
      cargarAlertas()
      // Actualizar los contadores
      cargarContadores()
      // Actualizar el contador en el contexto para el badge del sidebar
      actualizarContadorAlertas()
    } catch (error) {
      console.error("Error al marcar como vista:", error)
    }
  }

  const marcarComoResuelta = async (alertaId: number) => {
    try {
      await marcarAlertaComoResuelta(alertaId)
      // Actualizar la lista de alertas
      cargarAlertas()
      // Actualizar los contadores
      cargarContadores()
      // Actualizar el contador en el contexto para el badge del sidebar
      actualizarContadorAlertas()
    } catch (error) {
      console.error("Error al marcar como resuelta:", error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    let nuevoEstado = ""

    switch (value) {
      case "nuevas":
        nuevoEstado = "NUEVA"
        break
      case "vistas":
      default:
        nuevoEstado = "VISTA"
        break
    }

    setFiltros((prev) => ({ ...prev, estado: nuevoEstado, page: 0 }))
  }

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor || undefined,
      page: 0,
    }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      estado: "NUEVA",
      page: 0,
      size: 10,
      sort: "fechaCreacion,desc",
    })
    setActiveTab("nuevas")
  }

  // Usamos los contadores independientes en lugar de filtrar las alertas cargadas
  const { nuevas: alertasNuevas, vistas: alertasVistas } = contadores

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Alertas</h1>
          <p className="text-muted-foreground">Gestiona las notificaciones de tus vehículos y mantenimientos</p>
        </div>
        <div className="flex items-center gap-2">
          {alertasNuevas > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {alertasNuevas} nuevas
            </Badge>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en alertas..."
                value={filtros.search || ""}
                onChange={(e) => handleFiltroChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filtros.vehiculoId?.toString() || "all"}
              onValueChange={(value) => handleFiltroChange("vehiculoId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los vehículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vehículos</SelectItem>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtros.tipo || "all"} onValueChange={(value) => handleFiltroChange("tipo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="MANTENIMIENTO_PREVENTIVO">Mantenimiento Preventivo</SelectItem>
                <SelectItem value="FALLA_MECANICA">Falla Mecánica</SelectItem>
                <SelectItem value="STOCK_BAJO">Stock Bajo</SelectItem>
                <SelectItem value="VEHICULO_LISTO">Vehículo Listo</SelectItem>
                <SelectItem value="NUEVA_SOLICITUD">Nueva Solicitud</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por estado */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nuevas" className="flex items-center gap-2">
            Nuevas
            <Badge variant="destructive">{contadores.nuevas}</Badge>
          </TabsTrigger>
          <TabsTrigger value="vistas" className="flex items-center gap-2">
            Leídas
            <Badge variant="secondary">{contadores.vistas}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : alertas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes notificaciones</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === "nuevas"
                    ? "No tienes alertas nuevas en este momento."
                    : "No tienes alertas leídas."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <AlertaCard
                  key={alerta.id}
                  alerta={alerta}
                  onMarcarVista={marcarComoVista}
                  onMarcarResuelta={marcarComoResuelta}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
