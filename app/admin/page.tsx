"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardFilters } from "@/components/admin/dashboard-filters"
import { DashboardMetrics } from "@/components/admin/dashboard-metrics"
import { DashboardChart } from "@/components/admin/dashboard-chart"
import { dashboardApi } from "@/lib/dashboard-api"
import { toast } from "sonner"
import type { DashboardSummaryResponse, DashboardFilters as DashboardFiltersType } from "@/types/dashboard"

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardSummaryResponse>()
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<DashboardFiltersType>({
    groupBy: "MONTH",
  })

  const loadDashboardData = async (newFilters: DashboardFiltersType) => {
    try {
      setIsLoading(true)
      console.log("🔄 Cargando datos del dashboard con filtros:", newFilters)

      const response = await dashboardApi.getSummary(newFilters)
      setData(response)
      setFilters(newFilters)

      console.log("✅ Datos del dashboard cargados exitosamente")
    } catch (error) {
      console.error("❌ Error al cargar datos del dashboard:", error)
      toast.error("Error al cargar los datos del dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData(filters)
  }, [])

  const handleFiltersChange = (newFilters: DashboardFiltersType) => {
    loadDashboardData(newFilters)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Panel de control con métricas y estadísticas del sistema de talleres mecánicos.
          </p>
        </div>

        {/* Filtros */}
        <DashboardFilters onFiltersChange={handleFiltersChange} isLoading={isLoading} />

        {/* Métricas principales */}
        <DashboardMetrics data={data} isLoading={isLoading} />

        {/* Gráfico de ingresos */}
        <DashboardChart data={data} isLoading={isLoading} groupBy={filters.groupBy || "MONTH"} />
      </div>
    </AdminLayout>
  )
}
