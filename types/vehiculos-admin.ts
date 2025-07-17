export interface VehiculoRequest {
  clienteId: number
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
    tallerAsignado: {
      id: number
      nombre: string
    } | null
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
  clienteId?: number
  tallerAsignadoId?: number
  estado?: string
  fechaCreacionDesde?: string
  fechaCreacionHasta?: string
  page?: number
  size?: number
  sort?: string
}

export interface PageResponse<T> {
  content: T[]
  pageable: any
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  numberOfElements: number
  empty: boolean
}
