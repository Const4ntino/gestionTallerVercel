import type { FacturaClientePage, FacturaClienteResponse, FacturaClienteFilters } from "@/types/facturas-cliente"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Función para obtener el token de autenticación
function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Función para crear headers con autenticación
function createAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Obtener facturas del cliente con filtros
export async function obtenerMisFacturas(filters: FacturaClienteFilters = {}): Promise<FacturaClientePage> {
  const params = new URLSearchParams()

  if (filters.search) params.append("search", filters.search)
  if (filters.mantenimientoId) params.append("mantenimientoId", filters.mantenimientoId.toString())
  if (filters.fechaEmisionDesde) params.append("fechaEmisionDesde", filters.fechaEmisionDesde)
  if (filters.fechaEmisionHasta) params.append("fechaEmisionHasta", filters.fechaEmisionHasta)
  if (filters.minTotal) params.append("minTotal", filters.minTotal.toString())
  if (filters.maxTotal) params.append("maxTotal", filters.maxTotal.toString())
  if (filters.page !== undefined) params.append("page", filters.page.toString())
  if (filters.size !== undefined) params.append("size", filters.size.toString())
  if (filters.sort) params.append("sort", filters.sort)

  const response = await fetch(`${API_BASE_URL}/api/facturas/mis-facturas/filtrar?${params}`, {
    method: "GET",
    headers: createAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Error al obtener facturas: ${response.status}`)
  }

  return response.json()
}

// Obtener detalles completos de una factura
export async function obtenerDetallesFactura(id: number): Promise<FacturaClienteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/facturas/${id}/details`, {
    method: "GET",
    headers: createAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Error al obtener detalles de factura: ${response.status}`)
  }

  return response.json()
}

// Función para formatear fecha
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Función para formatear moneda
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(monto)
}
