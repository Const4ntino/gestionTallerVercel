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

export interface VehiculosPageResponse {
  content: VehiculoResponse[]
  pageable: {
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    pageSize: number
    pageNumber: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  first: boolean
  empty: boolean
}

export interface VehiculoFilters {
  search?: string
  estado?: string
  page?: number
  size?: number
  sort?: string
}
