import type { AlertaResponse, AlertaEstadoRequest, AlertaFilters, AlertasPageResponse } from "@/types/alertas-cliente"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const alertasClienteApi = {
  // Listar y filtrar alertas del cliente
  async obtenerMisAlertas(filters: AlertaFilters = {}): Promise<AlertasPageResponse> {
    console.log("🔍 Obteniendo alertas del cliente con filtros:", filters)

    const params = new URLSearchParams()

    if (filters.search) params.append("search", filters.search)
    if (filters.vehiculoId) params.append("vehiculoId", filters.vehiculoId.toString())
    if (filters.tipo) params.append("tipo", filters.tipo)
    if (filters.estado) params.append("estado", filters.estado)
    if (filters.page !== undefined) params.append("page", filters.page.toString())
    if (filters.size !== undefined) params.append("size", filters.size.toString())
    if (filters.sort) params.append("sort", filters.sort)

    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/alertas/mis-alertas/filtrar${queryString ? `?${queryString}` : ""}`

    console.log("📡 URL de request:", url)

    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("❌ Error al obtener alertas:", errorData)
      throw new Error(`Error al obtener alertas: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ Alertas obtenidas:", data)
    return data
  },

  // Marcar alerta como vista
  async marcarComoVista(alertaId: number): Promise<AlertaResponse> {
    console.log("👁️ Marcando alerta como vista:", alertaId)

    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    const response = await fetch(`${API_BASE_URL}/api/alertas/${alertaId}/marcar-vista`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("❌ Error al marcar como vista:", errorData)
      throw new Error(`Error al marcar como vista: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ Alerta marcada como vista:", data)
    return data
  },

  // Marcar alerta como resuelta
  async marcarComoResuelta(alertaId: number): Promise<void> {
    console.log("✅ Marcando alerta como resuelta:", alertaId)

    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    const requestBody: AlertaEstadoRequest = {
      estado: "RESUELTA",
    }

    const response = await fetch(`${API_BASE_URL}/api/alertas/${alertaId}/estado`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("❌ Error al marcar como resuelta:", errorData)
      throw new Error(`Error al marcar como resuelta: ${response.status}`)
    }

    console.log("✅ Alerta marcada como resuelta exitosamente")
  },
}
