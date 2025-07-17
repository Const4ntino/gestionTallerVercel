export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  nombreCompleto: string
  dni?: string
  correo: string
  username: string
  contrasena: string
  telefono: string
  direccion: string
}

export interface AuthResponse {
  token: string
  rol: string
  username: string
}

export type UserRole = "ADMINISTRADOR" | "ADMINISTRADOR_TALLER" | "TRABAJADOR" | "CLIENTE"

export interface User {
  username: string
  rol: UserRole
  token: string
}
