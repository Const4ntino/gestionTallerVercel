"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MantenimientosPendientes } from "@/components/admin/facturas/mantenimientos-pendientes"
import { GestionFacturas } from "@/components/admin/facturas/gestion-facturas"
import { FileText, Clock } from "lucide-react"

export default function FacturasPage() {
  const [activeTab, setActiveTab] = useState("pendientes")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Facturas</h1>
          <p className="text-muted-foreground">Administra las facturas y mantenimientos pendientes de facturar</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pendientes" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes de Facturar
            </TabsTrigger>
            <TabsTrigger value="facturas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Gestión de Facturas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendientes" className="space-y-4">
            <MantenimientosPendientes />
          </TabsContent>

          <TabsContent value="facturas" className="space-y-4">
            <GestionFacturas />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
