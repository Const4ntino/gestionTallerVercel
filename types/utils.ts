export interface FilterParams {
  [key: string]: any
  search?: string
  page?: number
  size?: number
  sort?: string
}

export interface PaginationInfo {
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ApiResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
    }
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
}
