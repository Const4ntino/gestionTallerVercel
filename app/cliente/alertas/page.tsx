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

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaResponse[]>([])
  const [vehiculos, setVehiculos] = useState<VehiculoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<AlertasFiltros>({
    estado: "NUEVA,VISTA", // Por defecto no mostrar resueltas
    page: 0,
    size: 10,
    sort: "fechaCreacion,desc",
  })
  const [totalElements, setTotalElements] = useState(0)
  const [currentTab, setCurrentTab] = useState("todas")

  useEffect(() => {
    cargarVehiculos()
  }, [])

  useEffect(() => {
    cargarAlertas()
  }, [filtros])

  const cargarVehiculos = async () => {
    try {
      const response = await obtenerVehiculosCliente()
      setVehiculos(response.content)
    } catch (error) {
      console.error("Error al cargar vehículos:", error)
    }
  }

  const cargarAlertas = async () => {
    try {
      setLoading(true)
      const response = await obtenerMisAlertas(filtros)
      setAlertas(response.content)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Error al cargar alertas:", error)
      toast.error("Error al cargar las alertas")
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarVista = async (alertaId: number) => {
    try {
      await marcarAlertaComoVista(alertaId)
      toast.success("Alerta marcada como leída")
      cargarAlertas()
    } catch (error) {
      console.error("Error al marcar alerta como vista:", error)
      toast.error("Error al marcar la alerta como leída")
    }
  }

  const handleMarcarResuelta = async (alertaId: number) => {
    try {
      await marcarAlertaComoResuelta(alertaId)
      toast.success("Alerta archivada correctamente")
      cargarAlertas()
    } catch (error) {
      console.error("Error al marcar alerta como resuelta:", error)
      toast.error("Error al archivar la alerta")
    }
  }

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
    let nuevoEstado = ""

    switch (value) {
      case "nuevas":
        nuevoEstado = "NUEVA"
        break
      case "vistas":
        nuevoEstado = "VISTA"
        break
      case "todas":
      default:
        nuevoEstado = "NUEVA,VISTA"
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
      estado: "NUEVA,VISTA",
      page: 0,
      size: 10,
      sort: "fechaCreacion,desc",
    })
    setCurrentTab("todas")
  }

  const alertasNuevas = alertas.filter((a) => a.estado === "NUEVA").length
  const alertasVistas = alertas.filter((a) => a.estado === "VISTA").length

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
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas" className="flex items-center gap-2">
            Todas
            <Badge variant="secondary">{totalElements}</Badge>
          </TabsTrigger>
          <TabsTrigger value="nuevas" className="flex items-center gap-2">
            Nuevas
            <Badge variant="destructive">{alertasNuevas}</Badge>
          </TabsTrigger>
          <TabsTrigger value="vistas" className="flex items-center gap-2">
            Leídas
            <Badge variant="secondary">{alertasVistas}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-6">
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
                  {currentTab === "nuevas"
                    ? "No tienes alertas nuevas en este momento."
                    : currentTab === "vistas"
                      ? "No tienes alertas leídas."
                      : "No tienes alertas pendientes en este momento."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <AlertaCard
                  key={alerta.id}
                  alerta={alerta}
                  onMarcarVista={handleMarcarVista}
                  onMarcarResuelta={handleMarcarResuelta}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
