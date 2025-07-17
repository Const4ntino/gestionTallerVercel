"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { DashboardSummaryResponse } from "@/types/dashboard"

interface DashboardChartProps {
  data?: DashboardSummaryResponse
  isLoading: boolean
  groupBy: "MONTH" | "YEAR"
}

export function DashboardChart({ data, isLoading, groupBy }: DashboardChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPeriod = (period: string) => {
    if (groupBy === "YEAR") {
      return period
    }

    // Para formato YYYY-MM, convertir a formato legible
    const [year, month] = period.split("-")
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    const monthIndex = Number.parseInt(month) - 1
    return `${monthNames[monthIndex]} ${year}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="space-y-4 w-full">
              <Skeleton className="h-8 w-48 mx-auto" />
              <div className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.ingresosPorPeriodo || Object.keys(data.ingresosPorPeriodo).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No hay datos de ingresos disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Convertir datos para el gráfico
  const chartData = Object.entries(data.ingresosPorPeriodo)
    .map(([period, amount]) => ({
      period: formatPeriod(period),
      ingresos: amount,
      originalPeriod: period,
    }))
    .sort((a, b) => a.originalPeriod.localeCompare(b.originalPeriod))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                labelStyle={{ color: "#000" }}
              />
              <Bar dataKey="ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
