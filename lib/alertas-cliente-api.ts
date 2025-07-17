import type { AlertaResponse, AlertaEstadoRequest, AlertasFiltros, AlertasResponse } from "@/types/alertas-cliente"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function obtenerMisAlertas(filtros: AlertasFiltros = {}): Promise<AlertasResponse> {
  const token = localStorage.getItem("token")
  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const params = new URLSearchParams()

  if (filtros.search) params.append("search", filtros.search)
  if (filtros.vehiculoId) params.append("vehiculoId", filtros.vehiculoId.toString())
  if (filtros.tipo) params.append("tipo", filtros.tipo)
  if (filtros.estado) params.append("estado", filtros.estado)
  if (filtros.page !== undefined) params.append("page", filtros.page.toString())
  if (filtros.size !== undefined) params.append("size", filtros.size.toString())
  if (filtros.sort) params.append("sort", filtros.sort)

  const url = `${API_BASE_URL}/api/alertas/mis-alertas/filtrar${params.toString() ? `?${params.toString()}` : ""}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error al obtener alertas: ${response.status}`)
  }

  return response.json()
}

export async function marcarAlertaComoVista(alertaId: number): Promise<AlertaResponse> {
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
    throw new Error(`Error al marcar alerta como vista: ${response.status}`)
  }

  return response.json()
}

export async function marcarAlertaComoResuelta(alertaId: number): Promise<void> {
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
    throw new Error(`Error al marcar alerta como resuelta: ${response.status}`)
  }
}
