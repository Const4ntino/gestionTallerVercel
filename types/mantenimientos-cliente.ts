export interface MantenimientoRequestCliente {
  vehiculoId: number
  servicioId: number
  observacionesCliente?: string
  estado: "SOLICITADO"
}

export interface MantenimientoResponseCliente {
  id: number
  vehiculo: {
    id: number
    placa: string
    marca: string
    modelo: string
  }
  servicio: {
    id: number
    nombre: string
    taller: {
      id: number
      nombre: string
    }
  }
  trabajador: {
    id: number
    usuario: {
      nombreCompleto: string
    }
    especialidad: string
  } | null
  estado: "SOLICITADO" | "EN_PROCESO" | "COMPLETADO" | "PENDIENTE" | "CANCELADO"
  fechaInicio: string | null
  fechaFin: string | null
  observacionesCliente: string | null
  observacionesTrabajador: string | null
  fechaCreacion: string
  fechaActualizacion: string
  productosUsados: Array<{
    producto: {
      id: number
      nombre: string
    }
    cantidadUsada: number
    precioEnUso: number
  }>
}

export interface MantenimientoFiltersCliente {
  search?: string
  vehiculoId?: number
  estado?: string
  page?: number
  size?: number
  sort?: string
}

export interface TallerResponse {
  id: number
  nombre: string
  direccion: string
  ciudad: string
  telefono: string
  email: string
  estado: string
}

export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
    }
  }
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
  numberOfElements: number
}
