export interface CategoriaProductoResponse {
  id: number
  nombre: string
  descripcion: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CategoriaProductoRequest {
  nombre: string
  descripcion: string
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

export interface ProductoResponse {
  id: number
  taller: TallerResponse
  nombre: string
  descripcion: string
  categoria: CategoriaProductoResponse
  imageUrl: string | null
  precio: number
  stock: number
  fechaCreacion: string
  fechaActualizacion: string
}

export interface ProductoRequest {
  tallerId: number
  nombre: string
  descripcion: string
  categoriaId: number
  imageUrl?: string | null
  precio: number
  stock: number
}

export interface ProductoFilterParams {
  search?: string
  tallerId?: number
  categoriaId?: number
  minPrecio?: number
  maxPrecio?: number
  minStock?: number
  maxStock?: number
  page?: number
  size?: number
  sort?: string
}

export interface CategoriaFilterParams {
  search?: string
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
