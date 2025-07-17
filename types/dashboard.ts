export interface DashboardSummaryResponse {
  totalMantenimientos: number
  totalClientes: number
  totalVehiculos: number
  totalIngresos: number
  ingresosPorPeriodo: Record<string, number>
}

export interface DashboardFilters {
  startDate?: string
  endDate?: string
  groupBy?: "MONTH" | "YEAR"
}
