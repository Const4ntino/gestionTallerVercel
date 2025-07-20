"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Users, Calendar, TrendingUp } from "lucide-react"

export default function AdminTallerDashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard del Taller</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimientos Activos</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 desde la semana pasada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+5 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Programadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Para esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Bienvenido al Panel del Taller</CardTitle>
            <CardDescription>Gestiona los mantenimientos y servicios de tu taller desde aquí.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Wrench className="h-6 w-6" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Gestión de Mantenimientos</p>
                  <p className="text-sm text-muted-foreground">
                    Administra todos los mantenimientos asignados a tu taller
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Calendar className="h-6 w-6" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Programación de Citas</p>
                  <p className="text-sm text-muted-foreground">Organiza y programa las citas de mantenimiento</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Mantenimiento completado</p>
                  <p className="text-sm text-muted-foreground">Vehículo ABC-123 - Cambio de aceite</p>
                </div>
                <div className="ml-auto font-medium">Hace 2h</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Nueva cita programada</p>
                  <p className="text-sm text-muted-foreground">Vehículo XYZ-789 - Revisión técnica</p>
                </div>
                <div className="ml-auto font-medium">Hace 4h</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Mantenimiento iniciado</p>
                  <p className="text-sm text-muted-foreground">Vehículo DEF-456 - Cambio de frenos</p>
                </div>
                <div className="ml-auto font-medium">Hace 6h</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
