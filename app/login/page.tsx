import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('/img/horizontal-main2.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="mb-4">
          <Link
            href="/landing"
            className="inline-flex items-center text-sm text-white hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Taller Mecánico</h1>
          <p className="text-blue-100">Sistema de Gestión Integral</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
