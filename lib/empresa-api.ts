import type { EmpresaResponse, EmpresaRequest, ArchivoResponse } from "@/types/empresa"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

function getAuthHeadersMultipart() {
  const token = localStorage.getItem("token")
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const empresaApi = {
  // Obtener datos de la empresa (siempre ID 1)
  getById: async (): Promise<EmpresaResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/empresas/1`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener datos de la empresa")
    return response.json()
  },

  // Actualizar datos de la empresa (siempre ID 1)
  update: async (data: EmpresaRequest): Promise<EmpresaResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/empresas/1`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Error al actualizar datos de la empresa")
    return response.json()
  },

  // Subir imagen (logo)
  uploadImage: async (file: File): Promise<ArchivoResponse> => {
    const formData = new FormData()
    formData.append("archivo", file)

    const response = await fetch(`${API_BASE_URL}/api/archivos/subir-imagen`, {
      method: "POST",
      headers: getAuthHeadersMultipart(),
      body: formData,
    })

    if (!response.ok) throw new Error("Error al subir la imagen")
    return response.json()
  },
}
