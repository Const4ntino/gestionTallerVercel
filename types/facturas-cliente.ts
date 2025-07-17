// Tipos para el módulo de facturas del cliente

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
  vehiculo: VehiculoFacturaResponse
  servicio: ServicioFacturaResponse
  estado: string
  observacionesTrabajador: string | null
  productosUsados: ProductoUsadoResponse[]
}

export interface VehiculoFacturaResponse {
  id: number
  placa: string
  marca: string
}

export interface ServicioFacturaResponse {
  id: number
  nombre: string
  precioBase: number
}

export interface ProductoUsadoResponse {
  producto: ProductoFacturaResponse
  cantidadUsada: number
  precioEnUso: number
}

export interface ProductoFacturaResponse {
  id: number
  nombre: string
}

export interface ClienteFacturaResponse {
  id: number
  usuario: UsuarioFacturaResponse
}

export interface UsuarioFacturaResponse {
  nombreCompleto: string
}

export interface TallerFacturaResponse {
  id: number
  nombre: string
}

// Tipos para filtros y paginación
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
  numberOfElements: number
}

// Tipos para la tabla
export interface FacturaClienteTableRow {
  id: number
  fecha: string
  vehiculo: string
  servicio: string
  taller: string
  total: number
  pdfDisponible: boolean
}
