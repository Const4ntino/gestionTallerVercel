"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, UserRole } from "@/types/auth"
import { getAuthData, clearAuthData } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (token: string, username: string, rol: UserRole) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authData = getAuthData()
    if (authData) {
      setUser({
        token: authData.token,
        username: authData.username,
        rol: authData.rol as UserRole,
      })
    }
    setIsLoading(false)
  }, [])

  const login = (token: string, username: string, rol: UserRole) => {
    const userData = { token, username, rol }
    setUser(userData)
  }

  const logout = () => {
    clearAuthData()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
