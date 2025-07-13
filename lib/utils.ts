import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, intervalToDuration } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "N/A"
  try {
    const date = new Date(isoString)
    return format(date, "dd/MM/yyyy, HH:mm", { locale: es })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Fecha inválida"
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`) // Always show seconds if no other parts or if it's 0

  return parts.join(" ")
}

export function getElapsedTime(startTime: string): string {
  try {
    const start = new Date(startTime)
    const now = new Date()
    const duration = intervalToDuration({ start, end: now })

    const parts = []
    if (duration.years && duration.years > 0) parts.push(`${duration.years}a`)
    if (duration.months && duration.months > 0) parts.push(`${duration.months}M`)
    if (duration.days && duration.days > 0) parts.push(`${duration.days}d`)
    if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}h`)
    if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}m`)
    if (duration.seconds && duration.seconds > 0) parts.push(`${duration.seconds}s`)

    return parts.length > 0 ? parts.join(" ") : "0s"
  } catch (error) {
    console.error("Error calculating elapsed time:", error)
    return "N/A"
  }
}
