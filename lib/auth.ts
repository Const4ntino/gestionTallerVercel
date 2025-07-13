const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export async function authFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error("Credenciales inválidas")
  }

  const data = await response.json()

  if (data.token) {
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
  }

  return data
}

export async function register(userData: any) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "Error en el registro")
  }

  return response.json()
}

/**
 * Elimina todos los datos de autenticación almacenados en localStorage.
 */
export function clearAuthData(): void {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("username") // por retro-compatibilidad
  localStorage.removeItem("rol") // por retro-compatibilidad
}

export function logout() {
  clearAuthData()
  window.location.href = "/login"
}

export function getStoredUser() {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}

export function getStoredToken() {
  if (typeof window === "undefined") return null

  return localStorage.getItem("token")
}

export function isAuthenticated() {
  return !!getStoredToken()
}
