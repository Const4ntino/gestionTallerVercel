export interface EmpresaResponse {
  id: number
  razon: string
  descripcion?: string
  ruc: string
  correo: string
  telefono: string
  direccion: string
  logo?: string
}

export interface EmpresaRequest {
  razon: string
  descripcion?: string
  ruc: string
  correo: string
  telefono: string
  direccion: string
  logo?: string
}

export interface ArchivoResponse {
  url: string
  mensaje: string
}
