"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import type { DashboardSummaryResponse } from "@/types/dashboard"

interface DashboardChartProps {
  data?: DashboardSummaryResponse
  isLoading: boolean
  groupBy: "MONTH" | "YEAR"
}

export function DashboardChart({ data, isLoading, groupBy }: DashboardChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount)
  }

  const formatPeriod = (period: string) => {
    if (groupBy === "YEAR") {
      return period
    }

    // Para formato YYYY-MM, convertir a formato más legible
    const [year, month] = period.split("-")
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.ingresosPorPeriodo || Object.keys(data.ingresosPorPeriodo).length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Ingresos por Período</CardTitle>
          <CardDescription>Visualización de ingresos {groupBy === "MONTH" ? "mensuales" : "anuales"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">No hay datos de ingresos disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Convertir los datos para el gráfico
  const chartData = Object.entries(data.ingresosPorPeriodo)
    .map(([period, amount]) => ({
      period: formatPeriod(period),
      ingresos: amount,
      originalPeriod: period,
    }))
    .sort((a, b) => a.originalPeriod.localeCompare(b.originalPeriod))

  const chartConfig = {
    ingresos: {
      label: "Ingresos",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Ingresos por Período</CardTitle>
        <CardDescription>Visualización de ingresos {groupBy === "MONTH" ? "mensuales" : "anuales"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
              />
              <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
