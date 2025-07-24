"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Users, Wrench, Car, DollarSign, FileDown } from "lucide-react"
import type { DashboardSummaryResponse } from "@/types/dashboard"
import { useToast } from "@/components/ui/use-toast"
import { getAuthToken } from "@/lib/auth"

interface DashboardMetricsProps {
  data?: DashboardSummaryResponse
  isLoading: boolean
}

export function DashboardMetrics({ data, isLoading }: DashboardMetricsProps) {
  const { toast } = useToast()
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-PE").format(num)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Resumen del Dashboard</h3>
        {/* Botón de PDF oculto temporalmente por solicitud del cliente */}
        {false && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={async () => {
              try {
                // Obtener el token de autenticación
                const token = getAuthToken();
                if (!token) {
                  toast({
                    title: "Error",
                    description: "No se pudo autenticar. Por favor, inicie sesión nuevamente.",
                    variant: "destructive",
                  });
                  return;
                }
                
                // Construir la URL con los mismos parámetros que se usaron para cargar los datos
                const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary/pdf`);
                
                // Obtener los parámetros de la URL actual para mantener los mismos filtros
                const urlParams = new URLSearchParams(window.location.search);
                const startDate = urlParams.get('startDate');
                const endDate = urlParams.get('endDate');
                const groupBy = urlParams.get('groupBy');
                
                // Añadir los parámetros a la URL si existen
                if (startDate) url.searchParams.append('startDate', startDate);
                if (endDate) url.searchParams.append('endDate', endDate);
                if (groupBy) url.searchParams.append('groupBy', groupBy);
                
                toast({
                  title: "Descargando PDF",
                  description: "Preparando la descarga del reporte...",
                });
                
                // Realizar la petición para descargar el PDF
                const response = await fetch(url.toString(), {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                
                if (!response.ok) {
                  throw new Error(`Error al descargar el PDF: ${response.statusText}`);
                }
                
                // Convertir la respuesta a blob
                const blob = await response.blob();
                
                // Crear un objeto URL para el blob
                const downloadUrl = window.URL.createObjectURL(blob);
                
                // Crear un elemento <a> para descargar el archivo
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'dashboard-report.pdf';
                document.body.appendChild(link);
                link.click();
                
                // Limpiar
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
                
                toast({
                  title: "Descarga completada",
                  description: "El reporte se ha descargado correctamente.",
                });
              } catch (error) {
                console.error('Error al descargar el PDF:', error);
                toast({
                  title: "Error",
                  description: "No se pudo descargar el reporte. Por favor, inténtelo de nuevo.",
                  variant: "destructive",
                });
              }
            }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mantenimientos</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalMantenimientos)}</div>
          <p className="text-xs text-muted-foreground">Mantenimientos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalClientes)}</div>
          <p className="text-xs text-muted-foreground">Clientes registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalVehiculos)}</div>
          <p className="text-xs text-muted-foreground">Vehículos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalIngresos)}</div>
          <p className="text-xs text-muted-foreground">Ingresos totales</p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
