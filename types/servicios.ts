export interface TallerResponse {
  id: number
  nombre: string
  ciudad: string
  direccion: string
  logoUrl: string | null
  estado: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface ServicioResponse {
  id: number
  taller: TallerResponse
  nombre: string
  descripcion: string
  precioBase: number
  duracionEstimadaHoras: number
  estado: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface ServicioRequest {
  tallerId: number
  nombre: string
  descripcion: string
  precioBase: number
  duracionEstimadaHoras: number
  estado: string
}

export interface ServicioFilterParams {
  search?: string
  tallerId?: number
  minPrecioBase?: number
  maxPrecioBase?: number
  minDuracionEstimadaHoras?: number
  maxDuracionEstimadaHoras?: number
  estado?: string
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
