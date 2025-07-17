import type { VehiculoResponse, VehiculoClientRequest, VehiculoFilters, PageResponse } from "@/types/vehiculos"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const obtenerMisVehiculos = async (filters: VehiculoFilters): Promise<PageResponse<VehiculoResponse>> => {
  const searchParams = new URLSearchParams()

  if (filters.search) searchParams.append("search", filters.search)
  if (filters.estado && filters.estado !== "all") searchParams.append("estado", filters.estado)
  if (filters.page !== undefined) searchParams.append("page", filters.page.toString())
  if (filters.size !== undefined) searchParams.append("size", filters.size.toString())
  if (filters.sort) searchParams.append("sort", filters.sort)

  const response = await fetch(`${API_BASE_URL}/api/clientes/mis-vehiculos/filtrar?${searchParams}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener vehículos")
  }

  return response.json()
}

// Alias – some parts of the codebase expect this name
export const obtenerVehiculosCliente = obtenerMisVehiculos

export const crearVehiculo = async (data: VehiculoClientRequest): Promise<VehiculoResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/vehiculos/cliente`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Error al crear vehículo")
  }

  return response.json()
}

export const actualizarVehiculo = async (id: number, data: VehiculoClientRequest): Promise<VehiculoResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/vehiculos/cliente/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Error al actualizar vehículo")
  }

  return response.json()
}

export const vehiculosApi = {
  obtenerMisVehiculos,
  obtenerVehiculosCliente, // 👈 new
  crearVehiculo,
  actualizarVehiculo,
}
