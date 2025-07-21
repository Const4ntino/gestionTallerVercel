"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Wrench,
  Car,
  Shield,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  ArrowRight,
  Settings,
  ShoppingCart,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const services = [
    {
      icon: <Wrench className="h-8 w-8 text-green-600" />,
      title: "Mantenimiento Especializado",
      description: "Servicios completos de mantenimiento preventivo y correctivo para todo tipo de vehículos.",
    },
    {
      icon: <Settings className="h-8 w-8 text-blue-600" />,
      title: "Reparaciones Técnicas",
      description: "Diagnóstico y reparación de sistemas mecánicos, eléctricos y electrónicos.",
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-orange-600" />,
      title: "Venta de Repuestos",
      description: "Amplio catálogo de productos y repuestos originales para tu vehículo.",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Garantía Asegurada",
      description: "Todos nuestros servicios incluyen garantía y seguimiento post-servicio.",
    },
  ]

  const features = [
    "Técnicos certificados y especializados",
    "Equipos de diagnóstico de última generación",
    "Repuestos originales y de calidad",
    "Atención personalizada y profesional",
    "Precios competitivos y transparentes",
    "Sistema de seguimiento en línea",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Taller Mecánico</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#servicios" className="text-gray-600 hover:text-green-600 transition-colors">
              Servicios
            </a>
            <a href="#nosotros" className="text-gray-600 hover:text-green-600 transition-colors">
              Nosotros
            </a>
            <a href="#contacto" className="text-gray-600 hover:text-green-600 transition-colors">
              Contacto
            </a>
          </nav>
          <Button onClick={() => router.push("/login")} className="bg-green-600 hover:bg-green-700">
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800">
            Servicio Profesional Garantizado
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Tu Vehículo en las
            <span className="text-green-600 block">Mejores Manos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Brindamos servicios especializados de mantenimiento vehicular y venta de productos de calidad. Crea tu
            cuenta y solicita tu mantenimiento de forma fácil y rápida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/register")}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
            >
              Crear Cuenta
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="text-lg px-8 py-3 border-green-600 text-green-600 hover:bg-green-50"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios especializados para mantener tu vehículo en óptimas condiciones
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">¿Por qué elegirnos?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Somos tu mejor opción para el cuidado y mantenimiento de tu vehículo. Contamos con la experiencia y
                tecnología necesaria para brindarte el mejor servicio.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <Clock className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">Horarios Flexibles</h3>
                  <p className="text-green-100 mb-6">
                    Atendemos de lunes a sábado con horarios que se adaptan a tu disponibilidad
                  </p>
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="font-semibold">Lun - Vie: 8:00 AM - 6:00 PM</p>
                    <p className="font-semibold">Sábados: 8:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Quiénes Somos?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Somos un taller mecánico especializado con años de experiencia en el sector automotriz. Nuestro compromiso
              es brindar servicios de calidad y mantener tu vehículo en las mejores condiciones.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Equipo Profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Contamos con técnicos certificados y especializados en diferentes marcas y modelos de vehículos.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Calidad Garantizada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Utilizamos repuestos originales y ofrecemos garantía en todos nuestros servicios y productos.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Confianza Total</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Miles de clientes satisfechos respaldan nuestro trabajo y compromiso con la excelencia.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para cuidar tu vehículo?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestra plataforma y gestiona el mantenimiento de tu vehículo de forma fácil y conveniente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/register")}
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Registrarse Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="text-lg px-8 py-3 border-white text-black hover:bg-white/10 hover:text-white"
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contáctanos</h2>
            <p className="text-xl text-gray-600">
              Estamos aquí para ayudarte. Contáctanos para cualquier consulta o información adicional.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <CardTitle>Teléfono</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">+51 999 888 777</p>
                <p className="text-gray-600">+51 01 234 5678</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Mail className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">info@tallermecanico.com</p>
                <p className="text-gray-600">servicios@tallermecanico.com</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <CardTitle>Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Av. Principal 123</p>
                <p className="text-gray-600">Lima, Perú</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Taller Mecánico</span>
              </div>
              <p className="text-gray-400">Tu socio confiable para el mantenimiento y cuidado de tu vehículo.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Mantenimiento Preventivo</li>
                <li>Reparaciones Generales</li>
                <li>Diagnóstico Computarizado</li>
                <li>Venta de Repuestos</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#nosotros" className="hover:text-white transition-colors">
                    Acerca de
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#contacto" className="hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Acceso</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/login")}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/register")}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Registrarse
                </Button>
              </div>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Taller Mecánico. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
