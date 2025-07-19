"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { EmpresaForm } from "@/components/admin/empresa/empresa-form"

export default function EmpresaPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Empresa</h1>
          <p className="text-muted-foreground">Gestiona la información de tu empresa</p>
        </div>
        <EmpresaForm />
      </div>
    </AdminLayout>
  )
}
