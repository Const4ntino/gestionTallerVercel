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

export interface TallerResponse {
  id: number
  nombre: string
  direccion: string
  telefono: string
  ciudad: string
  estado: string
  fechaCreacion: string
  fechaActualizacion: string
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

export interface UsuarioClienteRequest {
  nombreCompleto: string
  dni?: string
  correo: string
  username: string
  contrasena?: string
  telefono: string
  direccion?: string
  tallerAsignadoId?: number
}
