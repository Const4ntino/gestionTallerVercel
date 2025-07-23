"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { contarAlertasNuevas } from "@/lib/alertas-cliente-api"
import { useAuth } from "./auth-context"

interface AlertasContextType {
  alertasNuevas: number
  actualizarContadorAlertas: () => Promise<void>
  isLoading: boolean
}

const AlertasContext = createContext<AlertasContextType | undefined>(undefined)

export function AlertasProvider({ children }: { children: ReactNode }) {
  const [alertasNuevas, setAlertasNuevas] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { user, isLoading: authLoading } = useAuth()

  const actualizarContadorAlertas = async () => {
    if (!user || user.rol !== "CLIENTE") {
      setAlertasNuevas(0)
      setIsLoading(false)
      return
    }

    try {
      const count = await contarAlertasNuevas()
      setAlertasNuevas(count)
    } catch (error) {
      console.error("Error al obtener conteo de alertas nuevas:", error)
      setAlertasNuevas(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user && user.rol === "CLIENTE") {
      actualizarContadorAlertas()
    } else if (!authLoading) {
      setIsLoading(false)
    }
  }, [user, authLoading])

  return (
    <AlertasContext.Provider value={{ alertasNuevas, actualizarContadorAlertas, isLoading }}>
      {children}
    </AlertasContext.Provider>
  )
}

export function useAlertas() {
  const context = useContext(AlertasContext)
  if (context === undefined) {
    throw new Error("useAlertas debe ser usado dentro de un AlertasProvider")
  }
  return context
}
