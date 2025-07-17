const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

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

class DashboardApi {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getSummary(filters: DashboardFilters = {}): Promise<DashboardSummaryResponse> {
    try {
      console.log("🔍 Obteniendo resumen del dashboard con filtros:", filters)

      // Construir parámetros de consulta
      const params = new URLSearchParams()

      if (filters.startDate) {
        params.append("startDate", filters.startDate)
      }

      if (filters.endDate) {
        params.append("endDate", filters.endDate)
      }

      if (filters.groupBy) {
        params.append("groupBy", filters.groupBy)
      }

      const queryString = params.toString()
      const url = `${API_BASE_URL}/api/dashboard/summary${queryString ? `?${queryString}` : ""}`

      console.log("📡 URL de solicitud:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en respuesta del dashboard:", errorData)
        throw new Error(`Error ${response.status}: ${errorData.mensaje || "Error al obtener datos del dashboard"}`)
      }

      const data = await response.json()
      console.log("📊 Datos del dashboard recibidos:", data)

      return data
    } catch (error) {
      console.error("❌ Error al obtener resumen del dashboard:", error)
      throw error
    }
  }
}

export const dashboardApi = new DashboardApi()
