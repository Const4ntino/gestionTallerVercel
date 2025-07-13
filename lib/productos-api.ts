import type {
  ProductoResponse,
  ProductoRequest,
  CategoriaProductoResponse,
  CategoriaProductoRequest,
  ProductoFilterParams,
  CategoriaFilterParams,
  PageResponse,
} from "@/types/productos"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://d3cfeb645d76.ngrok-free.app"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// ===== PRODUCTOS API =====
export const productosApi = {
  getAll: async (): Promise<ProductoResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/productos`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener productos")
    return response.json()
  },

  getById: async (id: number): Promise<ProductoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener producto")
    return response.json()
  },

  create: async (data: ProductoRequest): Promise<ProductoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/productos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear producto")
    return response.json()
  },

  update: async (id: number, data: ProductoRequest): Promise<ProductoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar producto")
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar producto")
  },

  filter: async (params: ProductoFilterParams): Promise<PageResponse<ProductoResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/productos/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar productos")
    return response.json()
  },
}

// ===== CATEGORÍAS PRODUCTO API =====
export const categoriasProductoApi = {
  getAll: async (): Promise<CategoriaProductoResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/categorias-producto`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener categorías")
    return response.json()
  },

  getById: async (id: number): Promise<CategoriaProductoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/categorias-producto/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener categoría")
    return response.json()
  },

  getByNombre: async (nombre: string): Promise<CategoriaProductoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/categorias-producto/nombre/${encodeURIComponent(nombre)}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener categoría por nombre")
    return response.json()
  },

  create: async (data: CategoriaProductoRequest): Promise<CategoriaProductoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/categorias-producto`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear categoría")
    return response.json()
  },

  update: async (id: number, data: CategoriaProductoRequest): Promise<CategoriaProductoResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/categorias-producto/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar categoría")
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/categorias-producto/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar categoría")
  },

  filter: async (params: CategoriaFilterParams): Promise<PageResponse<CategoriaProductoResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/categorias-producto/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar categorías")
    return response.json()
  },
}
