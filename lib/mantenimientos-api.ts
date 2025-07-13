import type {
  MantenimientoResponse,
  MantenimientoRequest,
  MantenimientoFilterParams,
  PageResponse,
  VehiculoResponse,
  ServicioResponse,
  TrabajadorResponse,
  ProductoResponse,
} from "@/types/mantenimientos"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://d3cfeb645d76.ngrok-free.app"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// ===== MANTENIMIENTOS API =====
export const mantenimientosApi = {
  getAll: async (): Promise<MantenimientoResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/mantenimientos`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener mantenimientos")
    return response.json()
  },

  getById: async (id: number): Promise<MantenimientoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/mantenimientos/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener mantenimiento")
    return response.json()
  },

  create: async (data: MantenimientoRequest): Promise<MantenimientoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/mantenimientos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear mantenimiento")
    return response.json()
  },

  update: async (id: number, data: MantenimientoRequest): Promise<MantenimientoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/mantenimientos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar mantenimiento")
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/mantenimientos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar mantenimiento")
  },

  filter: async (params: MantenimientoFilterParams): Promise<PageResponse<MantenimientoResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/mantenimientos/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar mantenimientos")
    return response.json()
  },
}

// ===== APIS AUXILIARES =====
export const vehiculosApi = {
  getAll: async (): Promise<VehiculoResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/vehiculos`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener vehículos")
    return response.json()
  },
}

export const serviciosMantenimientoApi = {
  getAll: async (): Promise<ServicioResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/servicios`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener servicios")
    return response.json()
  },
}

export const trabajadoresMantenimientoApi = {
  getAll: async (): Promise<TrabajadorResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/trabajadores`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener trabajadores")
    return response.json()
  },
}

export const productosMantenimientoApi = {
  filterByTaller: async (tallerId: number, search?: string): Promise<ProductoResponse[]> => {
    const searchParams = new URLSearchParams()
    searchParams.append("tallerId", tallerId.toString())
    if (search) {
      searchParams.append("search", search)
    }

    const response = await fetch(`${API_BASE_URL}/api/productos/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener productos")
    const data = await response.json()
    return data.content || []
  },
}
