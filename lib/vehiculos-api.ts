import { authFetch } from "@/lib/auth"
import type { VehiculoResponse, VehiculoClientRequest, VehiculoFilterParams, PageResponse } from "@/types/vehiculos"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://d3cfeb645d76.ngrok-free.app"

export const vehiculosApi = {
  // Obtener mis vehículos con filtros
  getMisVehiculos: async (params: VehiculoFilterParams = {}): Promise<PageResponse<VehiculoResponse>> => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await authFetch(`${API_BASE_URL}/api/clientes/mis-vehiculos/filtrar?${searchParams}`)
    if (!response.ok) throw new Error("Error al obtener mis vehículos")
    return response.json()
  },

  // Crear nuevo vehículo
  create: async (data: VehiculoClientRequest): Promise<VehiculoResponse> => {
    const response = await authFetch(`${API_BASE_URL}/api/vehiculos/cliente`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear vehículo")
    return response.json()
  },

  // Actualizar vehículo existente
  update: async (id: number, data: VehiculoClientRequest): Promise<VehiculoResponse> => {
    const response = await authFetch(`${API_BASE_URL}/api/vehiculos/cliente/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar vehículo")
    return response.json()
  },

  // Obtener vehículo por ID (para edición)
  getById: async (id: number): Promise<VehiculoResponse> => {
    const response = await authFetch(`${API_BASE_URL}/api/vehiculos/${id}`)
    if (!response.ok) throw new Error("Error al obtener vehículo")
    return response.json()
  },
}
