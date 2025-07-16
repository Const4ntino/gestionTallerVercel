export interface FacturaClienteResponse {
  id: number
  mantenimiento: MantenimientoFacturaResponse
  cliente: ClienteFacturaResponse
  taller: TallerFacturaResponse
  fechaEmision: string
  total: number
  detalles: string | null
  pdfUrl: string | null
}

export interface MantenimientoFacturaResponse {
  id: number
  vehiculo: {
    id: number
    placa: string
    marca: string
    modelo?: string
  }
  servicio: {
    id: number
    nombre: string
    precioBase: number
  }
  estado: string
  observacionesTrabajador: string | null
  productosUsados: ProductoUsadoResponse[]
}

export interface ProductoUsadoResponse {
  producto: {
    id: number
    nombre: string
  }
  cantidadUsada: number
  precioEnUso: number
}

export interface ClienteFacturaResponse {
  id: number
  usuario: {
    nombreCompleto: string
    email: string
  }
}

export interface TallerFacturaResponse {
  id: number
  nombre: string
  direccion: string
}

export interface FacturaClienteFilters {
  search?: string
  mantenimientoId?: number
  fechaEmisionDesde?: string
  fechaEmisionHasta?: string
  minTotal?: number
  maxTotal?: number
  page?: number
  size?: number
  sort?: string
}

export interface FacturaClientePage {
  content: FacturaClienteResponse[]
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
}
