import type React from "react"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminTallerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
