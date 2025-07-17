import type { VehiculoRequest, VehiculoResponse, VehiculoFilterParams, PageResponse } from "@/types/vehiculos-admin"
import type { ClienteResponse } from "@/types/admin"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://4f95e785bfa1.ngrok-free.app"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const vehiculosAdminApi = {
  // Filtrar vehículos con paginación
  filter: async (params: VehiculoFilterParams): Promise<PageResponse<VehiculoResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/vehiculos/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar vehículos")
    return response.json()
  },

  // Obtener vehículo por ID
  getById: async (id: number): Promise<VehiculoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/vehiculos/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener vehículo")
    return response.json()
  },

  // Crear vehículo
  create: async (data: VehiculoRequest): Promise<VehiculoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/vehiculos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear vehículo")
    return response.json()
  },

  // Actualizar vehículo
  update: async (id: number, data: VehiculoRequest): Promise<VehiculoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/vehiculos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar vehículo")
    return response.json()
  },

  // Eliminar vehículo
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/vehiculos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar vehículo")
  },

  // Buscar clientes para el selector
  searchClientes: async (search: string): Promise<PageResponse<ClienteResponse>> => {
    const searchParams = new URLSearchParams()
    if (search) searchParams.append("search", search)
    searchParams.append("size", "10") // Limitar resultados para el selector

    const response = await fetch(`${API_BASE_URL}/api/clientes/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al buscar clientes")
    return response.json()
  },
}
