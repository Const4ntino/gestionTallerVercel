// Tipos para autenticación
export interface LoginRequest {
  username: string
  contrasena: string
}

export interface RegisterRequest {
  nombreCompleto: string
  correo: string
  username: string
  contrasena: string
}

export interface AuthResponse {
  token: string
  usuario: {
    id: number
    nombreCompleto: string
    correo: string
    username: string
    rol: string
  }
}

export interface AuthData {
  token: string
  usuario: {
    id: number
    nombreCompleto: string
    correo: string
    username: string
    rol: string
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://3c25d5c5b9b3.ngrok-free.app"

// Función para obtener headers de autenticación
export const getAuthHeaders = (): HeadersInit => {
  if (typeof window === "undefined") return {}

  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Función wrapper para fetch con autenticación automática
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// Función para limpiar datos de autenticación
export const clearAuthData = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
  }
}

// Función para guardar datos de autenticación
export const saveAuthData = (authData: AuthData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", authData.token)
    localStorage.setItem("usuario", JSON.stringify(authData.usuario))
  }
}

// Función para obtener datos de autenticación
export const getAuthData = (): AuthData | null => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("token")
  const usuarioStr = localStorage.getItem("usuario")

  if (!token || !usuarioStr) return null

  try {
    const usuario = JSON.parse(usuarioStr)
    return { token, usuario }
  } catch {
    return null
  }
}

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return getAuthData() !== null
}

// Función para obtener el usuario actual
export const getCurrentUser = () => {
  const authData = getAuthData()
  return authData?.usuario || null
}

// Función para verificar si el usuario tiene un rol específico
export const hasRole = (role: string): boolean => {
  const user = getCurrentUser()
  return user?.rol === role
}

// Función para login
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error("Error en el login")
  }

  return response.json()
}

// Función para registro
export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error("Error en el registro")
  }

  return response.json()
}

// Función para logout
export const logout = (): void => {
  clearAuthData()
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

// Función para verificar si el token es válido
export const verifyToken = async (): Promise<boolean> => {
  const authData = getAuthData()
  if (!authData) return false

  try {
    const response = await authFetch(`${API_BASE_URL}/api/auth/verify`)
    return response.ok
  } catch {
    return false
  }
}
