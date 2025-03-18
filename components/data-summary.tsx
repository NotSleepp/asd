"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, FileText, Calendar, Clock } from "lucide-react"

interface DataSummaryProps {
  data: any[]
  userStats: any[]
  accessStats: any[]
}

export function DataSummary({ data, userStats, accessStats }: DataSummaryProps) {
  // Calculate summary statistics
  const stats = useMemo(() => {
    // Count total records
    const totalRecords = data.length

    // Count unique users
    const uniqueUsers = new Set(data.map((item) => item.pkUsuario)).size

    // Count by type
    const ownQueries = data.filter((item) => item.esConsultaPropia).length
    const otherQueries = data.filter((item) => !item.esDesconocido && !item.esConsultaPropia).length
    const unknownQueries = data.filter((item) => item.esDesconocido).length

    // Count unique DNIs consulted
    const uniqueDnisConsulted = new Set(data.filter((item) => !item.esDesconocido).map((item) => item.dniConsulta)).size

    // Count by date
    const dateMap = new Map()
    data.forEach((item) => {
      const date = item.fechaConsulta.split(" ")[0]
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    })

    // Get date range
    const dates = Array.from(dateMap.keys()).sort()
    const firstDate = dates[0]
    const lastDate = dates[dates.length - 1]

    // Get most active date
    let mostActiveDate = ""
    let mostActiveCount = 0
    dateMap.forEach((count, date) => {
      if (count > mostActiveCount) {
        mostActiveCount = count
        mostActiveDate = date
      }
    })

    // Get high risk users
    const highRiskUsers = userStats.filter((user) => user.nivelSospecha >= 70)

    // Get high exposure profiles
    const highExposureProfiles = accessStats.filter((access) => access.nivelExposicion >= 70)

    return {
      totalRecords,
      uniqueUsers,
      ownQueries,
      otherQueries,
      unknownQueries,
      uniqueDnisConsulted,
      dateCount: dateMap.size,
      firstDate,
      lastDate,
      mostActiveDate,
      mostActiveCount,
      highRiskUsers,
      highExposureProfiles,
    }
  }, [data, userStats, accessStats])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Consultas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRecords}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {stats.ownQueries} propias
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.otherQueries} ajenas
              </Badge>
            </div>
            <div className="mt-1">
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.unknownQueries} desconocidas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Período de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dateCount} días</div>
            <div className="text-sm text-muted-foreground mt-2">Desde {formatDisplayDate(stats.firstDate)}</div>
            <div className="text-sm text-muted-foreground">Hasta {formatDisplayDate(stats.lastDate)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Día con Mayor Actividad
          </CardTitle>
          <CardDescription>
            {formatDisplayDate(stats.mostActiveDate)} con {stats.mostActiveCount} consultas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Promedio de {(stats.totalRecords / stats.dateCount).toFixed(1)} consultas por día en el período analizado
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatDisplayDate(dateStr: string) {
  try {
    const [year, month, day] = dateStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }

    return date.toLocaleDateString("es-ES", options)
  } catch (e) {
    return dateStr
  }
}

