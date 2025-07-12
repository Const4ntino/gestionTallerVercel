import type {
  UsuarioResponse,
  UsuarioRequest,
  UsuarioClienteRequest,
  UsuarioTrabajadorRequest,
  TrabajadorResponse,
  TrabajadorRequest,
  ClienteResponse,
  ClienteRequest,
  TallerResponse,
  TallerRequest,
  PageResponse,
  FilterParams,
} from "@/types/admin"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://d3cfeb645d76.ngrok-free.app"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// ===== USUARIOS API =====
export const usuariosApi = {
  getAll: async (): Promise<UsuarioResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener usuarios")
    return response.json()
  },

  getById: async (id: number): Promise<UsuarioResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener usuario")
    return response.json()
  },

  create: async (data: UsuarioRequest): Promise<UsuarioResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear usuario")
    return response.json()
  },

  createCliente: async (data: UsuarioClienteRequest): Promise<UsuarioResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/cliente`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear cliente")
    return response.json()
  },

  createTrabajador: async (data: UsuarioTrabajadorRequest): Promise<UsuarioResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/trabajador`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear trabajador")
    return response.json()
  },

  update: async (id: number, data: UsuarioRequest): Promise<UsuarioResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar usuario")
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar usuario")
  },

  filter: async (params: FilterParams): Promise<PageResponse<UsuarioResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/usuarios/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar usuarios")
    return response.json()
  },
}

// ===== TRABAJADORES API =====
export const trabajadoresApi = {
  getAll: async (): Promise<TrabajadorResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/trabajadores`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener trabajadores")
    return response.json()
  },

  getById: async (id: number): Promise<TrabajadorResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/trabajadores/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener trabajador")
    return response.json()
  },

  getByUsuarioId: async (usuarioId: number): Promise<TrabajadorResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/trabajadores/usuario/${usuarioId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener trabajador por usuario")
    return response.json()
  },

  create: async (data: TrabajadorRequest): Promise<TrabajadorResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/trabajadores`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear trabajador")
    return response.json()
  },

  update: async (id: number, data: TrabajadorRequest): Promise<TrabajadorResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/trabajadores/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar trabajador")
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/trabajadores/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar trabajador")
  },

  filter: async (
    params: FilterParams & { especialidad?: string; tallerId?: number },
  ): Promise<PageResponse<TrabajadorResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/trabajadores/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar trabajadores")
    return response.json()
  },
}

// ===== CLIENTES API =====
export const clientesApi = {
  getAll: async (): Promise<ClienteResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/clientes`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener clientes")
    return response.json()
  },

  getById: async (id: number): Promise<ClienteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener cliente")
    return response.json()
  },

  getByUsuarioId: async (usuarioId: number): Promise<ClienteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/clientes/usuario/${usuarioId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener cliente por usuario")
    return response.json()
  },

  create: async (data: ClienteRequest): Promise<ClienteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/clientes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear cliente")
    return response.json()
  },

  update: async (id: number, data: ClienteRequest): Promise<ClienteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar cliente")
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar cliente")
  },

  filter: async (
    params: FilterParams & { tallerAsignadoId?: number; telefono?: string },
  ): Promise<PageResponse<ClienteResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/clientes/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar clientes")
    return response.json()
  },
}

// ===== TALLERES API =====
export const talleresApi = {
  getAll: async (): Promise<TallerResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/talleres`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener talleres")
    return response.json()
  },

  getById: async (id: number): Promise<TallerResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/talleres/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener taller")
    return response.json()
  },

  getByNombre: async (nombre: string): Promise<TallerResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/talleres/nombre/${encodeURIComponent(nombre)}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener taller por nombre")
    return response.json()
  },

  create: async (data: TallerRequest): Promise<TallerResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/talleres`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear taller")
    return response.json()
  },

  update: async (id: number, data: TallerRequest): Promise<TallerResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/talleres/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar taller")
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/talleres/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al eliminar taller")
  },

  filter: async (
    params: FilterParams & { ciudad?: string; estado?: string },
  ): Promise<PageResponse<TallerResponse>> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/api/talleres/filtrar?${searchParams}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al filtrar talleres")
    return response.json()
  },
}
