"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Upload, Building } from "lucide-react"
import { empresaApi } from "@/lib/empresa-api"
import type { EmpresaRequest } from "@/types/empresa"

const empresaSchema = z.object({
  razon: z.string().min(1, "La razón social es requerida").max(100, "Máximo 100 caracteres"),
  descripcion: z.string().optional(),
  ruc: z
    .string()
    .min(11, "El RUC debe tener 11 dígitos")
    .max(11, "El RUC debe tener 11 dígitos")
    .regex(/^\d+$/, "El RUC solo debe contener números"),
  correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Formato de correo inválido")
    .max(100, "Máximo 100 caracteres"),
  telefono: z
    .string()
    .min(9, "El teléfono debe tener 9 dígitos")
    .max(9, "El teléfono debe tener 9 dígitos")
    .regex(/^\d+$/, "El teléfono solo debe contener números"),
  direccion: z.string().min(1, "La dirección es requerida"),
})

type EmpresaFormData = z.infer<typeof empresaSchema>

export function EmpresaForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
  })

  // Cargar datos de la empresa al montar el componente
  useEffect(() => {
    loadEmpresaData()
  }, [])

  const loadEmpresaData = async () => {
    try {
      setIsLoadingData(true)
      const empresa = await empresaApi.getById()

      reset({
        razon: empresa.razon,
        descripcion: empresa.descripcion || "",
        ruc: empresa.ruc,
        correo: empresa.correo,
        telefono: empresa.telefono,
        direccion: empresa.direccion,
      })

      if (empresa.logo) {
        setLogoUrl(`http://localhost:8080${empresa.logo}`)
      }
    } catch (error) {
      console.error("Error al cargar datos de la empresa:", error)
      toast.error("Error al cargar los datos de la empresa")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen válido")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo es muy grande. Máximo 5MB")
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUploadLogo = async () => {
    if (!selectedFile) {
      toast.error("Por favor selecciona un archivo primero")
      return
    }

    try {
      setIsUploadingLogo(true)
      const response = await empresaApi.uploadImage(selectedFile)
      setLogoUrl(`http://localhost:8080${response.url}`)
      toast.success("Logo subido exitosamente")
      setSelectedFile(null)

      // Limpiar el input file
      const fileInput = document.getElementById("logo-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Error al subir logo:", error)
      toast.error("Error al subir el logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const onSubmit = async (data: EmpresaFormData) => {
    try {
      setIsLoading(true)

      const empresaData: EmpresaRequest = {
        ...data,
        descripcion: data.descripcion || undefined,
      }

      // Si hay un logo subido, incluir la URL relativa
      if (logoUrl && logoUrl.includes("http://localhost:8080")) {
        empresaData.logo = logoUrl.replace("http://localhost:8080", "")
      }

      await empresaApi.update(empresaData)
      toast.success("Datos de la empresa actualizados exitosamente")
    } catch (error) {
      console.error("Error al actualizar empresa:", error)
      toast.error("Error al actualizar los datos de la empresa")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando datos de la empresa...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Información de la Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Grid responsivo para los campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Razón Social */}
            <div className="space-y-2">
              <Label htmlFor="razon">Razón Social *</Label>
              <Input id="razon" {...register("razon")} placeholder="Ingresa la razón social" maxLength={100} />
              {errors.razon && <p className="text-sm text-destructive">{errors.razon.message}</p>}
            </div>

            {/* RUC */}
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                {...register("ruc")}
                placeholder="12345678901"
                maxLength={11}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  target.value = target.value.replace(/\D/g, "")
                }}
              />
              {errors.ruc && <p className="text-sm text-destructive">{errors.ruc.message}</p>}
            </div>

            {/* Correo */}
            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico *</Label>
              <Input
                id="correo"
                type="email"
                {...register("correo")}
                placeholder="empresa@ejemplo.com"
                maxLength={100}
              />
              {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                {...register("telefono")}
                placeholder="987654321"
                maxLength={9}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  target.value = target.value.replace(/\D/g, "")
                }}
              />
              {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
            </div>
          </div>

          {/* Dirección - Ancho completo */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input id="direccion" {...register("direccion")} placeholder="Ingresa la dirección completa" />
            {errors.direccion && <p className="text-sm text-destructive">{errors.direccion.message}</p>}
          </div>

          {/* Secciones de Logo y Descripción en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* CUADRO ROJO - Sección del Logo */}
            <div className="space-y-4 border border-transparent">
              <Label className="text-lg font-medium">Logo de la Empresa</Label>
              
              {/* Controles de subida */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input id="logo-input" type="file" accept="image/*" onChange={handleFileSelect} />
                  <p className="text-sm text-muted-foreground">Formatos soportados: JPG, PNG, GIF. Máximo 5MB.</p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadLogo}
                  disabled={!selectedFile || isUploadingLogo}
                  className="w-full bg-transparent"
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Eliminar logo actual y subir logo seleccionado
                    </>
                  )}
                </Button>
              </div>

              {/* Vista previa del logo */}
              <div className="space-y-2 mt-4">
                <Label>Vista Previa</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 aspect-square flex items-center justify-center bg-muted/10">
                  {logoUrl ? (
                    <img
                      src={logoUrl || "/placeholder.svg"}
                      alt="Logo de la empresa"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sin logo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CUADRO AZUL - Descripción y Botones */}
            <div className="space-y-6 border border-transparent">
              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-lg font-medium">Descripción</Label>
                <Textarea
                  id="descripcion"
                  {...register("descripcion")}
                  placeholder="Descripción de la empresa (opcional)"
                  rows={8}
                  className="min-h-[200px]"
                />
                {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion.message}</p>}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={loadEmpresaData} 
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Actualizar Datos"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
