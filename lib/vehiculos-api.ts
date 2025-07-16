import { authFetch } from "./auth"
import type { VehiculoClientRequest, VehiculoResponse, VehiculosPageResponse, VehiculoFilters } from "@/types/vehiculos"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function obtenerMisVehiculos(filters: VehiculoFilters = {}): Promise<VehiculosPageResponse> {
  const params = new URLSearchParams()

  if (filters.search) params.append("search", filters.search)
  if (filters.estado) params.append("estado", filters.estado)
  if (filters.page !== undefined) params.append("page", filters.page.toString())
  if (filters.size !== undefined) params.append("size", filters.size.toString())
  if (filters.sort) params.append("sort", filters.sort)

  const response = await authFetch(`${API_BASE_URL}/api/clientes/mis-vehiculos/filtrar?${params}`)

  if (!response.ok) {
    throw new Error("Error al obtener los vehículos")
  }

  return response.json()
}

export async function crearVehiculo(vehiculo: VehiculoClientRequest): Promise<VehiculoResponse> {
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
}

export async function actualizarVehiculo(id: number, vehiculo: VehiculoClientRequest): Promise<VehiculoResponse> {
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
}
