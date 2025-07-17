import type { ClienteResponse, UsuarioClienteRequest } from "@/types/cliente-perfil"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const clientePerfilApi = {
  // Obtener datos del cliente autenticado
  obtenerMisDatos: async (): Promise<ClienteResponse> => {
    console.log("🔄 Iniciando carga de datos del cliente...")

    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    try {
      console.log("🔍 Obteniendo datos del cliente...")
      const response = await fetch(`${API_BASE_URL}/api/clientes/mis-datos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en la respuesta:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📊 Datos recibidos:", data)
      return data
    } catch (error) {
      console.error("❌ Error detallado al cargar datos:", error)
      throw error
    }
  },

  // Actualizar datos del cliente
  actualizarMisDatos: async (datos: UsuarioClienteRequest): Promise<ClienteResponse> => {
    console.log("🔄 Iniciando actualización de datos del cliente...")

    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    // Si la contraseña está vacía, no la enviamos
    const datosLimpios = { ...datos }
    if (!datosLimpios.contrasena || datosLimpios.contrasena.trim() === "") {
      delete datosLimpios.contrasena
    }

    try {
      console.log("📤 Enviando datos:", datosLimpios)
      const response = await fetch(`${API_BASE_URL}/api/clientes/mis-datos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosLimpios),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en la actualización:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Datos actualizados correctamente:", data)
      return data
    } catch (error) {
      console.error("❌ Error detallado al actualizar datos:", error)
      throw error
    }
  },
}
