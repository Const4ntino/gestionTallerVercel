export interface UsuarioResponse {
  id: number
  nombreCompleto: string
  dni?: string
  correo: string
  username: string
  rol: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface UsuarioRequest {
  nombreCompleto: string
  dni?: string
  correo: string
  username: string
  contrasena: string
  rol: string
}

export interface UsuarioClienteRequest {
  nombreCompleto: string
  dni?: string
  correo: string
  username: string
  contrasena: string
  telefono: string
  direccion: string
  tallerAsignadoId: number
}

export interface UsuarioTrabajadorRequest {
  nombreCompleto: string
  dni?: string
  correo: string
  username: string
  contrasena: string
  especialidad: string
  tallerId: number
}

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

export interface TallerRequest {
  nombre: string
  ciudad: string
  direccion: string
  logoUrl?: string | null
  estado: string
}

export interface TrabajadorResponse {
  id: number
  usuario: UsuarioResponse
  especialidad: string
  taller: TallerResponse
  fechaCreacion: string
  fechaActualizacion: string
}

export interface TrabajadorRequest {
  usuarioId: number
  especialidad: string
  tallerId: number
}

export interface ClienteResponse {
  id: number
  usuario: UsuarioResponse
  telefono: string
  direccion: string
  tallerAsignado: TallerResponse
  fechaCreacion: string
  fechaActualizacion: string
}

export interface ClienteRequest {
  usuarioId: number
  telefono: string
  direccion: string
  tallerAsignadoId: number
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

export interface FilterParams {
  search?: string
  rol?: string
  fechaCreacionDesde?: string
  fechaCreacionHasta?: string
  fechaActualizacionDesde?: string
  fechaActualizacionHasta?: string
  // Filtros específicos para clientes
  tallerAsignadoId?: number
  telefono?: string
  // Filtros específicos para trabajadores
  especialidad?: string
  tallerId?: number
  // Filtros específicos para talleres
  ciudad?: string
  estado?: string
  page?: number
  size?: number
  sort?: string
}
