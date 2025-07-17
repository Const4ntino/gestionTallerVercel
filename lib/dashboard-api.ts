import type { DashboardSummaryResponse, DashboardFilters } from "@/types/dashboard"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://4f95e785bfa1.ngrok-free.app"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const dashboardApi = {
  getSummary: async (filters: DashboardFilters = {}): Promise<DashboardSummaryResponse> => {
    console.log("🔄 Obteniendo resumen del dashboard con filtros:", filters)

    const searchParams = new URLSearchParams()

    if (filters.startDate) {
      searchParams.append("startDate", filters.startDate)
    }
    if (filters.endDate) {
      searchParams.append("endDate", filters.endDate)
    }
    if (filters.groupBy) {
      searchParams.append("groupBy", filters.groupBy)
    }

    const url = `${API_BASE_URL}/api/dashboard/summary${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    console.log("🌐 URL de solicitud:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error en respuesta del dashboard:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`Error al obtener resumen del dashboard: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Datos del dashboard recibidos:", data)
      return data
    } catch (error) {
      console.error("❌ Error al obtener resumen del dashboard:", error)
      throw error
    }
  },
}
