import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function MisDatosLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario de edición skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre completo */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Correo */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </div>

            {/* Botón */}
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Información de solo lectura skeleton */}
        <div className="space-y-6">
          {/* Información de cuenta */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>

              <Separator />

              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taller asignado */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
