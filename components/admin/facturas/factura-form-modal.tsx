"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QrDialog } from "./qr-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { facturasApi } from "@/lib/facturas-api"
import { mantenimientosApi } from "@/lib/mantenimientos-api"
import { productosMantenimientoApi } from "@/lib/mantenimientos-api"
import type { MantenimientoPendienteFacturar, CalculatedTotalResponse, FacturaRequest } from "@/types/facturas"
import { MetodoPago } from "@/types/facturas"
import type { ProductoResponse, MantenimientoProductoRequest } from "@/types/mantenimientos"
import { Car, User, Wrench, Package, Receipt, PlusCircle, Trash2, Loader2, Upload, CreditCard, FileText } from "lucide-react"

interface FacturaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantenimiento: MantenimientoPendienteFacturar
  calculatedTotal: CalculatedTotalResponse
  onSuccess: () => void
}

interface ProductoUsado {
  productoId: number
  cantidadUsada: number
  precioEnUso: number
  subtotal: number
}

export function FacturaFormModal({
  open,
  onOpenChange,
  mantenimiento,
  calculatedTotal,
  onSuccess,
}: FacturaFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [detalles, setDetalles] = useState("")
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [productosUsados, setProductosUsados] = useState<ProductoUsado[]>([])
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [actualizandoProductos, setActualizandoProductos] = useState(false)
  // Inicializar con el valor correcto del total calculado
  const [totalCalculado, setTotalCalculado] = useState(calculatedTotal?.totalCalculado || 0)
  
  // Nuevos estados para los campos adicionales
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(MetodoPago.EN_EFECTIVO)
  const [nroOperacion, setNroOperacion] = useState<string>("")
  const [imagenOperacion, setImagenOperacion] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  
  // Estados para los nuevos campos solicitados
  const [conIgv, setConIgv] = useState<boolean>(false)
  const [tipoComprobante, setTipoComprobante] = useState<string>("BOLETA")
  const [ruc, setRuc] = useState<string>("")
  
  // Estado para controlar el diálogo de QR
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  
  // Ref para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar datos completos del mantenimiento cuando se abre el modal
  useEffect(() => {
    if (open && mantenimiento) {
      // Cargar datos completos del mantenimiento para asegurar que tenemos todos los productos
      loadMantenimientoCompleto(mantenimiento.id)
      
      // Cargar productos del taller para tener referencia de nombres
      if (mantenimiento.servicio?.taller?.id) {
        loadProductosByTaller(mantenimiento.servicio.taller.id)
      }
    }
  }, [open, mantenimiento])
  
  // Función para cargar los datos completos del mantenimiento
  const loadMantenimientoCompleto = async (mantenimientoId: number) => {
    try {
      setLoading(true)
      // Obtener el mantenimiento completo con todos sus productos
      const mantenimientoCompleto = await mantenimientosApi.getById(mantenimientoId)
      
      // Inicializar productos usados desde el mantenimiento completo
      if (mantenimientoCompleto.productosUsados && mantenimientoCompleto.productosUsados.length > 0) {
        const productosFormateados = mantenimientoCompleto.productosUsados.map(p => ({
          productoId: p.producto.id,
          cantidadUsada: p.cantidadUsada,
          precioEnUso: p.precioEnUso,
          subtotal: p.precioEnUso * p.cantidadUsada
        }))
        setProductosUsados(productosFormateados)
      } else {
        setProductosUsados([])
      }
      
      // Actualizar el total calculado desde el backend
      const totalResponse = await facturasApi.calcularTotal(mantenimientoId)
      setTotalCalculado(totalResponse.totalCalculado)
    } catch (error) {
      console.error("Error al cargar el mantenimiento completo:", error)
      toast.error("Error al cargar los detalles del mantenimiento")
      setProductosUsados([])
    } finally {
      setLoading(false)
    }
  }
  
    // Función para cargar productos si es necesario en el futuro
  const loadProductosByTaller = async (tallerId: number) => {
    try {
      setLoadingProductos(true)
      const productosResponse = await productosMantenimientoApi.filterByTaller(tallerId)
      setProductos(productosResponse)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast.error("Error al cargar los productos disponibles")
    } finally {
      setLoadingProductos(false)
    }
  }
  
  // Función para formatear el precio
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencyDisplay: "narrowSymbol",
    }).format(amount).replace("PEN", "S/");
  }
  
  // Función para manejar la selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenOperacion(file);
      
      // Crear una URL para previsualizar la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Función para limpiar la imagen seleccionada
  const clearImage = () => {
    setImagenOperacion(null);
    setImagenPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que el número de operación sea obligatorio cuando el método de pago no es EFECTIVO
    if (metodoPago !== MetodoPago.EN_EFECTIVO && (!nroOperacion || nroOperacion.trim() === "")) {
      toast.error("El número de operación es obligatorio para este método de pago")
      return
    }
    
    // Validar que el RUC sea obligatorio cuando el tipo de comprobante es FACTURA
    if (tipoComprobante === "FACTURA" && (!ruc || ruc.trim() === "" || ruc.length !== 11)) {
      toast.error("El RUC es obligatorio y debe tener 11 dígitos para facturas")
      return
    }
    
    setLoading(true)

    try {
      const facturaRequest: FacturaRequest = {
        mantenimientoId: mantenimiento.id,
        clienteId: mantenimiento.vehiculo.cliente.id,
        tallerId: mantenimiento.servicio.taller.id,
        detalles: detalles || undefined,
        metodoPago: metodoPago,
        nroOperacion: nroOperacion || undefined,
        tipo: tipoComprobante, // Agregamos el tipo de comprobante
      }

      // Usamos el método create modificado que enviará los parámetros conIgv y ruc
      await facturasApi.create(
        facturaRequest, 
        imagenOperacion || undefined, 
        conIgv, 
        tipoComprobante === "FACTURA" ? ruc : undefined
      )
      
      toast.success("Factura creada exitosamente")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error al crear la factura:", error)
      toast.error("Error al crear la factura")
    } finally {
      setLoading(false)
    }
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Crear Factura
          </DialogTitle>
          <DialogDescription>Crear factura para el mantenimiento completado</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Mantenimiento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Mantenimiento</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Vehículo:</span>
                  <span>
                    {mantenimiento.vehiculo?.marca || "N/A"} {mantenimiento.vehiculo?.modelo || "N/A"}
                  </span>
                  <Badge variant="outline">{mantenimiento.vehiculo?.placa || "Sin placa"}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cliente:</span>
                  <span>{mantenimiento.vehiculo?.cliente?.usuario?.nombreCompleto || "Cliente no disponible"}</span>
                </div>

                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Servicio:</span>
                    <span>{mantenimiento.servicio?.nombre || "Servicio no disponible"}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    S/ {mantenimiento.servicio?.precioBase?.toLocaleString('es-PE', { minimumFractionDigits: 2 }) || '0.00'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-medium">Trabajador:</span>
                  <span className="ml-2">{mantenimiento.trabajador?.usuario?.nombreCompleto || "No asignado"}</span>
                  {mantenimiento.trabajador?.especialidad && (
                    <Badge className="ml-2" variant="secondary">
                      {mantenimiento.trabajador.especialidad}
                    </Badge>
                  )}
                </div>

                <div>
                  <span className="font-medium">Taller:</span>
                  <span className="ml-2">{mantenimiento.servicio?.taller?.nombre || "Taller no disponible"}</span>
                </div>

                <div>
                  <span className="font-medium">Finalizado:</span>
                  <span className="ml-2">
                    {mantenimiento.fechaFin ? formatDate(mantenimiento.fechaFin) : "Fecha no disponible"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos Utilizados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos Utilizados
              </h3>
            </div>

            {productosUsados.length === 0 ? (
              <div className="text-center p-4 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No hay productos agregados</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 bg-muted/30 rounded-lg text-sm font-medium">
                  <div>Producto</div>
                  <div>Cantidad</div>
                  <div>Subtotal</div>
                </div>
                
                {productosUsados.map((producto, index) => {
                  // Buscar el nombre del producto
                  const productoInfo = productos.find(p => p.id === producto.productoId);
                  return (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{productoInfo?.nombre || "Producto no disponible"}</div>
                        <div className="text-xs text-muted-foreground">
                          Precio unitario: {formatCurrency(producto.precioEnUso)}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {producto.cantidadUsada}
                      </div>
                      
                      <div className="flex items-center font-medium">
                        {formatCurrency(producto.subtotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Resumen de Facturación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resumen de Facturación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Precio base del servicio:</span>
                  <span className="font-medium">{formatCurrency(mantenimiento.servicio?.precioBase || 0)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Subtotal de productos:</span>
                  <span className="font-medium">{formatCurrency(productosUsados.reduce((sum, p) => sum + p.subtotal, 0))}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total a Facturar:</span>
                  <span className="font-bold text-lg">{formatCurrency(totalCalculado)}</span>
                </div>
              </div>
              
              {/* Opciones de Facturación */}
              <div className="space-y-4 border-l pl-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="conIgv"
                    checked={conIgv}
                    onChange={(e) => setConIgv(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="conIgv" className="text-sm font-medium cursor-pointer">
                    Incluir IGV (18%)
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipoComprobante" className="flex items-center gap-1">
                    Tipo de Comprobante
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={tipoComprobante} 
                    onValueChange={(value) => {
                      setTipoComprobante(value)
                      // Si cambia de FACTURA a BOLETA, limpiamos el RUC
                      if (value === "BOLETA") {
                        setRuc("")
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione tipo de comprobante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOLETA">Boleta</SelectItem>
                      <SelectItem value="FACTURA">Factura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {tipoComprobante === "FACTURA" && (
                  <div className="space-y-2">
                    <Label htmlFor="ruc" className="flex items-center gap-1">
                      RUC
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ruc"
                      placeholder="Ingrese el RUC"
                      value={ruc}
                      onChange={(e) => {
                        // Solo permitir números y limitar a 11 dígitos
                        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11)
                        setRuc(value)
                      }}
                      required={tipoComprobante === "FACTURA"}
                      className={tipoComprobante === "FACTURA" && (!ruc || ruc.length !== 11) ? "border-destructive" : ""}
                    />
                    {tipoComprobante === "FACTURA" && (!ruc || ruc.length !== 11) && (
                      <p className="text-xs text-destructive mt-1">El RUC debe tener 11 dígitos</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Método de Pago */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pago
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="metodoPago">Seleccione el método de pago</Label>
                <div className="flex gap-2 items-center">
                  <Select 
                    value={metodoPago} 
                    onValueChange={(value) => setMetodoPago(value as MetodoPago)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccione método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MetodoPago.EN_EFECTIVO}>Efectivo</SelectItem>
                      <SelectItem value={MetodoPago.TRANSFERENCIA}>Transferencia</SelectItem>
                      <SelectItem value={MetodoPago.YAPE}>Yape</SelectItem>
                      <SelectItem value={MetodoPago.PLIN}>Plin</SelectItem>
                      <SelectItem value={MetodoPago.DEPOSITO}>Depósito</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {metodoPago !== MetodoPago.EN_EFECTIVO && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQrDialogOpen(true)}
                    >
                      Ver QR
                    </Button>
                  )}
                </div>
              </div>
              
              {metodoPago !== MetodoPago.EN_EFECTIVO && (
                <div className="space-y-2">
                  <Label htmlFor="nroOperacion" className="flex items-center gap-1">
                    Número de Operación
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nroOperacion"
                    placeholder="Ingrese el número de operación"
                    value={nroOperacion}
                    onChange={(e) => setNroOperacion(e.target.value)}
                    required
                    className={!nroOperacion ? "border-destructive" : ""}
                  />
                  {!nroOperacion && (
                    <p className="text-xs text-destructive mt-1">Este campo es obligatorio</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Imagen de Operación (solo para métodos que no sean efectivo) */}
            {metodoPago !== MetodoPago.EN_EFECTIVO && (
              <Card className="mt-4">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Comprobante de Pago
                    </h4>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Subir Imagen
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {imagenPreview && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={clearImage}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                    
                    {imagenPreview && (
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <img 
                          src={imagenPreview} 
                          alt="Vista previa del comprobante" 
                          className="max-h-64 object-contain mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detalles Adicionales */}
          <div className="space-y-2">
            <Label htmlFor="detalles">Detalles Adicionales (Opcional)</Label>
            <Textarea
              id="detalles"
              placeholder="Ingrese detalles adicionales para la factura..."
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Factura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      {/* Diálogo QR para métodos de pago */}
      <QrDialog 
        open={qrDialogOpen} 
        onOpenChange={setQrDialogOpen} 
        metodoPago={metodoPago} 
      />
    </Dialog>
  )
}
