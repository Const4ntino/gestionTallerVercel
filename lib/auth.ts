import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

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
