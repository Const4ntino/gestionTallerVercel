import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"

/**
 * Punto base de la API.  Usa la variable de entorno en producción y
 * localhost en desarrollo por defecto.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/* -------------------------------------------------------------------------- */
/* Helpers de cabeceras y fetch con token JWT                                 */
/* -------------------------------------------------------------------------- */

/**
 * Devuelve el objeto `headers` con Content-Type JSON y, si existe,
 * el token JWT en la cabecera `Authorization`.
 */
export function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

/**
 * Versión envoltorio de `fetch` que inyecta el token, preservando
 * el resto de la configuración que se le pase.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers({
    ...getAuthHeaders(),
    ...(init.headers ?? {}),
  })

  return fetch(input, { ...init, headers })
}

/* -------------------------------------------------------------------------- */
/*  Funciones de autenticación (LOGIN / REGISTER)                             */
/* -------------------------------------------------------------------------- */

/**
 * Inicia sesión con las credenciales suministradas.
 *
 * Alias externo exportado como `loginUser` para compatibilidad.
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Error en el inicio de sesión")
  }

  const data: AuthResponse = await res.json()
  saveAuthData(data)
  return data
}

/**
 * Registra un nuevo usuario.
 *
 * Alias externo exportado como `registerUser` para compatibilidad.
 */
export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Error en el registro")
  }

  const data: AuthResponse = await res.json()
  saveAuthData(data)
  return data
}

/* -------------------------------------------------------------------------- */
/*  Persistencia en localStorage                                              */
/* -------------------------------------------------------------------------- */

/**
 * Guarda el token, el nombre de usuario y el rol en localStorage.
 */
export function saveAuthData(auth: AuthResponse): void {
  if (typeof window === "undefined") return
  localStorage.setItem("token", auth.token)
  localStorage.setItem("username", auth.username)
  localStorage.setItem("rol", auth.rol)
  // Se guarda también el objeto completo por conveniencia
  localStorage.setItem("user", JSON.stringify(auth))
}

/**
 * Recupera los datos de autenticación almacenados.
 */
export function getAuthData() {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("token")
  const username = localStorage.getItem("username")
  const rol = localStorage.getItem("rol")

  if (!token || !username || !rol) return null
  return { token, username, rol }
}

/**
 * Elimina todos los datos de autenticación.
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  localStorage.removeItem("username")
  localStorage.removeItem("rol")
  localStorage.removeItem("user")
}

/* -------------------------------------------------------------------------- */
/*  Utilidades varias                                                         */
/* -------------------------------------------------------------------------- */

export function logout() {
  clearAuthData()
  // Redirigimos al usuario a /login
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

export function isAuthenticated() {
  return typeof window !== "undefined" && !!localStorage.getItem("token")
}

/* -------------------------------------------------------------------------- */
/*  ALIAS para mantener compatibilidad                                        */
/* -------------------------------------------------------------------------- */

// Mantener los nombres antiguos usados en el resto del proyecto
export { login as loginUser, register as registerUser }
