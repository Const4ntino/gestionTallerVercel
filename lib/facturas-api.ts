import { authFetch } from "./auth"
import type {
  FacturaResponse,
  FacturaRequest,
  CalculatedTotalResponse,
  MantenimientoPendienteFacturar,
  FacturaFilterParams,
  MetodoPago,
} from "@/types/facturas"
import type { PageResponse } from "@/types/admin"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Función auxiliar para obtener headers con autenticación para multipart/form-data
const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem("token")
  return {
    Authorization: token ? `Bearer ${token}` : "",
  }
}

export const facturasApi = {
  // Mantenimientos pendientes de facturar
  async getMantenimientosPendientes(
    params: {
      page?: number
      size?: number
      sort?: string
    } = {},
  ): Promise<PageResponse<MantenimientoPendienteFacturar>> {
    const searchParams = new URLSearchParams()
    if (params.page !== undefined) searchParams.append("page", params.page.toString())
    if (params.size !== undefined) searchParams.append("size", params.size.toString())
    if (params.sort) searchParams.append("sort", params.sort)

    const response = await authFetch(`${API_BASE_URL}/api/facturas/mantenimientos-pendientes-facturar?${searchParams}`)

    if (!response.ok) {
      throw new Error("Error al obtener mantenimientos pendientes")
    }

    return response.json()
  },

  // Calcular total para un mantenimiento
  async calcularTotal(mantenimientoId: number): Promise<CalculatedTotalResponse> {
    const response = await authFetch(`${API_BASE_URL}/api/facturas/calcular-total/${mantenimientoId}`)

    if (!response.ok) {
      throw new Error("Error al calcular el total")
    }

    return response.json()
  },

  // Subir imagen de operación
  async uploadOperationImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append("archivo", file)

    const response = await fetch(`${API_BASE_URL}/api/archivos/subir-imagen`, {
      method: "POST",
      headers: getAuthHeadersMultipart(),
      body: formData,
    })

    if (!response.ok) throw new Error("Error al subir la imagen de operación")
    // El backend devuelve una cadena de texto con la URL, no un JSON
    const url = await response.text()
    return { url } // Convertimos la respuesta de texto a un objeto con la propiedad url
  },

  // Obtener todas las facturas
  async getAll(): Promise<FacturaResponse[]> {
    const response = await authFetch(`${API_BASE_URL}/api/facturas`)

    if (!response.ok) {
      throw new Error("Error al obtener facturas")
    }

    return response.json()
  },

  // Obtener factura por ID
  async getById(id: number): Promise<FacturaResponse> {
    const response = await authFetch(`${API_BASE_URL}/api/facturas/${id}`)

    if (!response.ok) {
      throw new Error("Error al obtener la factura")
    }

    return response.json()
  },

  // Obtener detalles completos de una factura
  async getDetails(id: number): Promise<FacturaResponse> {
    const response = await authFetch(`${API_BASE_URL}/api/facturas/${id}/details`)

    if (!response.ok) {
      throw new Error("Error al obtener los detalles de la factura")
    }

    return response.json()
  },

  // Crear nueva factura
  async create(
    factura: FacturaRequest, 
    imagenOperacion?: File, 
    conIgv: boolean = false, 
    ruc?: string
  ): Promise<FacturaResponse> {
    // Siempre usamos el endpoint con-imagen para asegurar que el trigger de la base de datos funcione correctamente
    const formData = new FormData()
    formData.append("factura", new Blob([JSON.stringify(factura)], { type: "application/json" }))
    
    // Agregamos la imagen si existe
    if (imagenOperacion) {
      formData.append("imagenOperacion", imagenOperacion)
    }
    
    // Agregamos los nuevos parámetros
    formData.append("conIgv", conIgv.toString())
    if (ruc) {
      formData.append("ruc", ruc)
    }

    const response = await fetch(`${API_BASE_URL}/api/facturas/con-imagen`, {
      method: "POST",
      headers: getAuthHeadersMultipart(),
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Error al crear la factura")
    }

    return response.json()
  },

  // Actualizar factura
  async update(
    id: number, 
    factura: FacturaRequest, 
    imagenOperacion?: File, 
    conIgv: boolean = false, 
    ruc?: string
  ): Promise<FacturaResponse> {
    // Siempre usamos el endpoint con-imagen para asegurar que el trigger de la base de datos funcione correctamente
    const formData = new FormData()
    formData.append("factura", new Blob([JSON.stringify(factura)], { type: "application/json" }))
    
    // Agregamos la imagen si existe
    if (imagenOperacion) {
      formData.append("imagenOperacion", imagenOperacion)
    }
    
    // Agregamos los nuevos parámetros
    formData.append("conIgv", conIgv.toString())
    if (ruc) {
      formData.append("ruc", ruc)
    }

    const response = await fetch(`${API_BASE_URL}/api/facturas/${id}/con-imagen`, {
      method: "PUT",
      headers: getAuthHeadersMultipart(),
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Error al actualizar la factura")
    }

    return response.json()
  },

  // Eliminar factura
  async delete(id: number): Promise<void> {
    const response = await authFetch(`${API_BASE_URL}/api/facturas/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Error al eliminar la factura")
    }
  },

  // Filtrar facturas
  async filter(params: FacturaFilterParams): Promise<PageResponse<FacturaResponse>> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    const response = await authFetch(`${API_BASE_URL}/api/facturas/filtrar?${searchParams}`)

    if (!response.ok) {
      throw new Error("Error al filtrar facturas")
    }

    return response.json()
  },
}
