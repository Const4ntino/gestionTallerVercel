export interface FacturaResponse {
  id: number
  mantenimiento: {
    id: number
    vehiculo: {
      id: number
      placa: string
      marca: string
      modelo: string
      cliente: {
        id: number
        usuario: {
          nombreCompleto: string
        }
      }
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
    }
    estado: string
    fechaInicio: string
    fechaFin: string
    observacionesCliente: string
    observacionesTrabajador: string
    fechaCreacion: string
    fechaActualizacion: string
    productosUsados: Array<{
      mantenimientoId: number
      producto: {
        id: number
        nombre: string
        precio: number
      }
      cantidadUsada: number
      precioEnUso: number
    }>
  }
  cliente: {
    id: number
    usuario: {
      nombreCompleto: string
    }
  }
  taller: {
    id: number
    nombre: string
  }
  fechaEmision: string
  total: number
  detalles: string
  pdfUrl: string | null
}

export interface FacturaRequest {
  mantenimientoId: number
  clienteId: number
  tallerId: number
  detalles?: string
  pdfUrl?: string | null
}

export interface CalculatedTotalResponse {
  mantenimientoId: number
  totalCalculado: number
}

export interface MantenimientoPendienteFacturar {
  id: number
  vehiculo: {
    id: number
    placa: string
    marca: string
    modelo: string
    cliente: {
      id: number
      usuario: {
        nombreCompleto: string
      }
    }
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
  }
  estado: string
  fechaInicio: string
  fechaFin: string
  observacionesCliente: string
  observacionesTrabajador: string
  fechaCreacion: string
  fechaActualizacion: string
  productosUsados: Array<{
    mantenimientoId: number
    producto: {
      id: number
      nombre: string
      precio: number
    }
    cantidadUsada: number
    precioEnUso: number
  }>
}

export interface FacturaFilterParams {
  search?: string
  mantenimientoId?: number
  clienteId?: number
  tallerId?: number
  fechaEmisionDesde?: string
  fechaEmisionHasta?: string
  minTotal?: number
  maxTotal?: number
  page?: number
  size?: number
  sort?: string
}
