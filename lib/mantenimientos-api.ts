import { authFetch } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Interfaces para mantenimientos
export interface VehiculoResponse {
  id: number
  cliente: {
    id: number
    usuario: {
      nombreCompleto: string
    }
    telefono: string
    direccion: string
    tallerAsignado: {
      id: number
      nombre: string
    }
  }
  placa: string
  marca: string
  modelo: string
  anio: number
  motor: string
  tipoVehiculo: string
  estado: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface ServicioResponse {
  id: number
  nombre: string
  descripcion: string
  precio: number
  taller: {
    id: number
    nombre: string
  }
}

export interface TrabajadorResponse {
  id: number
  usuario: {
    nombreCompleto: string
  }
  especialidad: string
  taller: {
    id: number
    nombre: string
  }
}

export interface ProductoResponse {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: {
    id: number
    nombre: string
  }
}

// API para mantenimientos
export const mantenimientosApi = {
  getAll: async () => {
    const response = await authFetch(`${API_BASE_URL}/api/mantenimientos`)
    if (!response.ok) throw new Error("Error al obtener mantenimientos")
    return response.json()
  },

  getById: async (id: number) => {
    const response = await authFetch(`${API_BASE_URL}/api/mantenimientos/${id}`)
    if (!response.ok) throw new Error("Error al obtener mantenimiento")
    return response.json()
  },

  create: async (data: any) => {
    const response = await authFetch(`${API_BASE_URL}/api/mantenimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al crear mantenimiento")
    return response.json()
  },

  update: async (id: number, data: any) => {
    const response = await authFetch(`${API_BASE_URL}/api/mantenimientos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar mantenimiento")
    return response.json()
  },

  delete: async (id: number) => {
    const response = await authFetch(`${API_BASE_URL}/api/mantenimientos/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Error al eliminar mantenimiento")
  },
}

// API para vehículos
export const vehiculosApi = {
  getAll: async () => {
    const response = await authFetch(`${API_BASE_URL}/api/vehiculos`)
    if (!response.ok) throw new Error("Error al obtener vehículos")
    return response.json()
  },

  filter: async (search = "", estado = "") => {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (estado) params.append("estado", estado)

    const response = await authFetch(`${API_BASE_URL}/api/vehiculos/filtrar?${params.toString()}`)
    if (!response.ok) throw new Error("Error al filtrar vehículos")
    return response.json()
  },
}

// API para servicios de mantenimiento
export const serviciosMantenimientoApi = {
  getAll: async () => {
    const response = await authFetch(`${API_BASE_URL}/api/servicios`)
    if (!response.ok) throw new Error("Error al obtener servicios")
    return response.json()
  },
}

// API para trabajadores de mantenimiento
export const trabajadoresMantenimientoApi = {
  getAll: async () => {
    const response = await authFetch(`${API_BASE_URL}/api/trabajadores`)
    if (!response.ok) throw new Error("Error al obtener trabajadores")
    return response.json()
  },
}

// API para productos de mantenimiento
export const productosMantenimientoApi = {
  getAll: async () => {
    const response = await authFetch(`${API_BASE_URL}/api/productos`)
    if (!response.ok) throw new Error("Error al obtener productos")
    return response.json()
  },
}
