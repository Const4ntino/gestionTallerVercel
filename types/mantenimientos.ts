export interface VehiculoResponse {
  id: number
  placa: string
  marca: string
  modelo: string
  cliente: {
    id: number
    usuario: {
      nombreCompleto: string
      dni?: string
      correo: string
    }
  }
}

export interface ServicioResponse {
  id: number
  nombre: string
  precioBase?: number
  taller: {
    id: number
    nombre: string
  }
}

export interface TrabajadorResponse {
  id: number
  usuario: {
    nombreCompleto: string
  }
  especialidad: string
}

export interface ProductoResponse {
  id: number
  nombre: string
  precio: number
}

export interface MantenimientoProductoResponse {
  mantenimientoId: number
  producto: ProductoResponse
  cantidadUsada: number
  precioEnUso: number
}

export interface MantenimientoProductoRequest {
  productoId: number
  cantidadUsada: number
  precioEnUso: number
}

export interface MantenimientoResponse {
  id: number
  vehiculo: VehiculoResponse
  servicio: ServicioResponse
  trabajador: TrabajadorResponse | null
  estado: MantenimientoEstado
  fechaInicio: string | null
  fechaFin: string | null
  observacionesCliente: string | null
  observacionesTrabajador: string | null
  fechaCreacion: string
  fechaActualizacion: string
  productosUsados: MantenimientoProductoResponse[]
  estaFacturado?: boolean
}

export interface MantenimientoRequest {
  vehiculoId: number
  servicioId: number
  trabajadorId?: number | null
  estado: MantenimientoEstado
  fechaInicio?: string | null
  fechaFin?: string | null
  observacionesCliente?: string | null
  observacionesTrabajador?: string | null
  productosUsados?: MantenimientoProductoRequest[]
}

export type MantenimientoEstado = "SOLICITADO" | "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO"

export interface MantenimientoFilterParams {
  search?: string
  vehiculoId?: number
  servicioId?: number
  trabajadorId?: number
  estado?: MantenimientoEstado
  fechaInicioDesde?: string
  fechaInicioHasta?: string
  fechaFinDesde?: string
  fechaFinHasta?: string
  estaFacturado?: boolean
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

export interface MantenimientoStats {
  solicitado: number
  pendiente: number
  enProceso: number
  completado: number
  cancelado: number
  total: number
}
