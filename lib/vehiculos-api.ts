import { authFetch } from "./auth"
import type { VehiculoResponse, VehiculoClientRequest, VehiculoFilters, PageResponse } from "@/types/vehiculos"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const vehiculosApi = {
  // Obtener mis vehículos (para clientes)
  getMisVehiculos: async (filters: VehiculoFilters): Promise<PageResponse<VehiculoResponse>> => {
    const params = new URLSearchParams()

    if (filters.search) params.append("search", filters.search)
    if (filters.estado && filters.estado !== "ALL") params.append("estado", filters.estado)
    params.append("page", filters.page.toString())
    params.append("size", filters.size.toString())
    if (filters.sort) params.append("sort", filters.sort)

    const response = await authFetch(`${API_BASE_URL}/api/clientes/mis-vehiculos/filtrar?${params}`)

    if (!response.ok) {
      throw new Error("Error al obtener los vehículos")
    }

    return response.json()
  },

  // Crear vehículo (para clientes)
  createVehiculo: async (vehiculo: VehiculoClientRequest): Promise<VehiculoResponse> => {
    const response = await authFetch(`${API_BASE_URL}/api/vehiculos/cliente`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vehiculo),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Error al crear el vehículo")
    }

    return response.json()
  },

  // Actualizar vehículo (para clientes)
  updateVehiculo: async (id: number, vehiculo: VehiculoClientRequest): Promise<VehiculoResponse> => {
    const response = await authFetch(`${API_BASE_URL}/api/vehiculos/cliente/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vehiculo),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Error al actualizar el vehículo")
    }

    return response.json()
  },
}

// Funciones de compatibilidad
export const obtenerMisVehiculos = vehiculosApi.getMisVehiculos
export const crearVehiculo = vehiculosApi.createVehiculo
export const actualizarVehiculo = vehiculosApi.updateVehiculo
