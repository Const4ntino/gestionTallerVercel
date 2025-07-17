// Reutilizamos los tipos base del módulo de mantenimientos general
export * from "./mantenimientos"

// Parámetros de filtrado específicos para admin taller
export interface MantenimientoTallerFilterParams {
  search?: string
  vehiculoId?: number
  servicioId?: number
  trabajadorId?: number
  estado?: "SOLICITADO" | "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO"
  fechaInicioDesde?: string
  fechaInicioHasta?: string
  fechaFinDesde?: string
  fechaFinHasta?: string
  page?: number
  size?: number
  sort?: string
}
