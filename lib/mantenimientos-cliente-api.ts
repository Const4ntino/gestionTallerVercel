import type {
  MantenimientoResponseCliente,
  MantenimientoRequestCliente,
  MantenimientoFiltersCliente,
  PageResponse,
  TallerResponse,
} from "@/types/mantenimientos-cliente"
import type { VehiculoResponse } from "@/types/vehiculos"
import type { ServicioResponse } from "@/types/servicios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const obtenerMisMantenimientos = async (
  filters: MantenimientoFiltersCliente,
): Promise<PageResponse<MantenimientoResponseCliente>> => {
  const searchParams = new URLSearchParams()

  if (filters.search) searchParams.append("search", filters.search)
  if (filters.vehiculoId) searchParams.append("vehiculoId", filters.vehiculoId.toString())
  if (filters.estado && filters.estado !== "all") searchParams.append("estado", filters.estado)
  if (filters.page !== undefined) searchParams.append("page", filters.page.toString())
  if (filters.size !== undefined) searchParams.append("size", filters.size.toString())
  if (filters.sort) searchParams.append("sort", filters.sort)

  const response = await fetch(`${API_BASE_URL}/api/mantenimientos/mis-mantenimientos/filtrar?${searchParams}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener mantenimientos")
  }

  return response.json()
}

export const crearMantenimiento = async (data: MantenimientoRequestCliente): Promise<MantenimientoResponseCliente> => {
  const response = await fetch(`${API_BASE_URL}/api/mantenimientos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Error al crear mantenimiento")
  }

  return response.json()
}

export const obtenerMantenimiento = async (id: number): Promise<MantenimientoResponseCliente> => {
  const response = await fetch(`${API_BASE_URL}/api/mantenimientos/${id}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener mantenimiento")
  }

  return response.json()
}

export const obtenerMisVehiculosParaMantenimiento = async (): Promise<VehiculoResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/api/clientes/mis-vehiculos/filtrar?size=100`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener vehículos")
  }

  const data = await response.json()
  return data.content
}

export const obtenerTalleresDisponibles = async (): Promise<TallerResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/api/talleres/filtrar?size=100&estado=ACTIVO`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener talleres")
  }

  const data = await response.json()
  return data.content || []
}

export const obtenerServiciosDisponibles = async (tallerId?: number): Promise<ServicioResponse[]> => {
  const searchParams = new URLSearchParams()
  if (tallerId) searchParams.append("tallerId", tallerId.toString())
  searchParams.append("size", "100")

  const response = await fetch(`${API_BASE_URL}/api/servicios/filtrar?${searchParams}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Error al obtener servicios")
  }

  const data = await response.json()
  return data.content || []
}
