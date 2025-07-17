export interface AlertaResponse {
  id: number
  vehiculo: {
    id: number
    placa: string
  } | null
  cliente: {
    id: number
    usuario: {
      nombreCompleto: string
    }
  }
  taller: {
    id: number
    nombre: string
  } | null
  tipo: "MANTENIMIENTO_PREVENTIVO" | "FALLA_MECANICA" | "STOCK_BAJO" | "VEHICULO_LISTO" | "NUEVA_SOLICITUD"
  mensaje: string
  estado: "NUEVA" | "VISTA" | "RESUELTA"
  fechaCreacion: string
}

export interface AlertaEstadoRequest {
  estado: "RESUELTA"
}

export interface AlertaFilters {
  search?: string
  vehiculoId?: number
  tipo?: string
  estado?: string
  page?: number
  size?: number
  sort?: string
}

export interface AlertasPageResponse {
  content: AlertaResponse[]
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
