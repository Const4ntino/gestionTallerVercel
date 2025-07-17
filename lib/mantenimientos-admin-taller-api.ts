import type {
  MantenimientoResponse,
  MantenimientoRequest,
  PageResponse,
  VehiculoResponse,
  ServicioResponse,
  TrabajadorResponse,
  ProductoResponse,
  MantenimientoProductoRequest,
} from "@/types/mantenimientos"
import type { MantenimientoTallerFilterParams } from "@/types/mantenimientos-admin-taller"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Función para obtener el tallerId del usuario autenticado
function getTallerId(): number {
  const user = localStorage.getItem("user")
  if (user) {
    const userData = JSON.parse(user)
    return userData.tallerId || userData.taller?.id
  }
  throw new Error("No se pudo obtener el ID del taller")
}

// ===== MANTENIMIENTOS API PARA ADMIN TALLER =====
export const mantenimientosTallerApi = {
  // Endpoint específico para filtrar por taller
  filter: async (params: MantenimientoTallerFilterParams): Promise<PageResponse<MantenimientoResponse>> => {
    const tallerId = getTallerId()
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/mantenimientos/taller/${tallerId}/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar mantenimientos del taller")
    return response.json()
  },

  // Los demás endpoints son los mismos que el admin general
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

  updateProductos: async (
    mantenimientoId: number,
    productosUsados: MantenimientoProductoRequest[],
  ): Promise<MantenimientoResponse> => {
    const mantenimiento = await mantenimientosTallerApi.getById(mantenimientoId)

    const updateRequest: MantenimientoRequest = {
      vehiculoId: mantenimiento.vehiculo.id,
      servicioId: mantenimiento.servicio.id,
      trabajadorId: mantenimiento.trabajador?.id,
      estado: mantenimiento.estado,
      observacionesCliente: mantenimiento.observacionesCliente || "",
      observacionesTrabajador: mantenimiento.observacionesTrabajador || "",
      productosUsados: productosUsados,
    }

    const response = await fetch(`${API_BASE_URL}/api/mantenimientos/${mantenimientoId}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateRequest),
    })

    if (!response.ok) throw new Error("Error al actualizar productos del mantenimiento")
    return response.json()
  },
}

// ===== APIS AUXILIARES FILTRADAS POR TALLER =====
export const vehiculosTallerApi = {
  filter: async (search?: string, estado?: string): Promise<PageResponse<VehiculoResponse>> => {
    const tallerId = getTallerId()
    const searchParams = new URLSearchParams()

    if (search) searchParams.append("search", search)
    if (estado) searchParams.append("estado", estado)
    searchParams.append("tallerAsignadoId", tallerId.toString())
    searchParams.append("size", "50")

    const response = await fetch(`${API_BASE_URL}/api/vehiculos/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar vehículos del taller")
    return response.json()
  },
}

export const serviciosTallerApi = {
  getAll: async (): Promise<ServicioResponse[]> => {
    const tallerId = getTallerId()
    const response = await fetch(`${API_BASE_URL}/api/servicios/filtrar?tallerId=${tallerId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener servicios del taller")
    const data = await response.json()
    return Array.isArray(data) ? data : data.content || []
  },
}

export const trabajadoresTallerApi = {
  getAll: async (): Promise<TrabajadorResponse[]> => {
    const tallerId = getTallerId()
    const response = await fetch(`${API_BASE_URL}/api/trabajadores/filtrar?tallerId=${tallerId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener trabajadores del taller")
    const data = await response.json()
    return Array.isArray(data) ? data : data.content || []
  },
}

export const productosTallerApi = {
  getAll: async (): Promise<ProductoResponse[]> => {
    const tallerId = getTallerId()
    const response = await fetch(`${API_BASE_URL}/api/productos/filtrar?tallerId=${tallerId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener productos del taller")
    const data = await response.json()
    return data.content || []
  },

  filterByTaller: async (search?: string): Promise<ProductoResponse[]> => {
    const tallerId = getTallerId()
    const searchParams = new URLSearchParams()
    searchParams.append("tallerId", tallerId.toString())
    if (search) {
      searchParams.append("search", search)
    }

    const response = await fetch(`${API_BASE_URL}/api/productos/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener productos del taller")
    const data = await response.json()
    return data.content || []
  },
}
