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
  estado: "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO"
  fechaCreacion: string
  fechaActualizacion: string
}

export interface VehiculoClientRequest {
  placa: string
  marca?: string
  modelo?: string
  anio?: number
  motor?: string
  tipoVehiculo?: string
  estado: "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO"
}

export interface VehiculoFilters {
  search?: string
  estado?: string
  page?: number
  size?: number
  sort?: string
}

export interface PageResponse<T> {
  content: T[]
  pageable: any
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}
