import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://3c25d5c5b9b3.ngrok-free.app"

export async function loginUser(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Error en el inicio de sesión")
  }

  return response.json()
}

export async function registerUser(userData: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Error en el registro")
  }

  return response.json()
}

export function saveAuthData(authResponse: AuthResponse): void {
  localStorage.setItem("token", authResponse.token)
  localStorage.setItem("username", authResponse.username)
  localStorage.setItem("rol", authResponse.rol)
}

export function getAuthData() {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("token")
  const username = localStorage.getItem("username")
  const rol = localStorage.getItem("rol")

  if (!token || !username || !rol) return null

  return { token, username, rol }
}

export function clearAuthData(): void {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
  localStorage.removeItem("rol")
}

/**
 * Wrapper de `fetch` que inyecta automáticamente el token JWT guardado en
 * `localStorage` (si existe) en la cabecera `Authorization`.
 *
 *  @param input — URL o RequestInfo
 *  @param init  — Opciones del fetch estándar
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  // Para evitar errores en SSR comprobamos que estamos en el navegador
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Combinamos las cabeceras existentes con Authorization (si hay token)
  const headers = new Headers(init.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}
