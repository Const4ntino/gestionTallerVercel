import type { ServicioResponse, ServicioRequest, ServicioFilterParams, PageResponse } from "@/types/servicios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://4f95e785bfa1.ngrok-free.app"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// ===== SERVICIOS API =====
export const serviciosApi = {
  getAll: async (): Promise<ServicioResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/servicios`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener servicios")
    return response.json()
  },

  getById: async (id: number): Promise<ServicioResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/servicios/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener servicio")
    return response.json()
  },

  create: async (data: ServicioRequest): Promise<ServicioResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/servicios`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear servicio")
    return response.json()
  },

  update: async (id: number, data: ServicioRequest): Promise<ServicioResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/servicios/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar servicio")
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/servicios/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar servicio")
  },

  filter: async (params: ServicioFilterParams): Promise<PageResponse<ServicioResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/servicios/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar servicios")
    return response.json()
  },
}
