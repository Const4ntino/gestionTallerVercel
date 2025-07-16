// Tipos para el módulo de vehículos del cliente
export interface VehiculoClientRequest {
  placa: string
  marca?: string
  modelo?: string
  anio?: number
  motor?: string
  tipoVehiculo?: string
  estado: "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO"
}

export interface VehiculoResponse {
  id: number
  cliente: {
    id: number
    usuario: {
      id: number
      nombreCompleto: string
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

export interface VehiculoFilterParams {
  search?: string
  estado?: "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO"
  page?: number
  size?: number
  sort?: string
}

export interface PageResponse<T> {
  content: T[]
  pageable: any
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: any
  numberOfElements: number
  first: boolean
  empty: boolean
}
