"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, Calendar, Clock } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimelineViewProps {
  data: any[]
}

export function TimelineView({ data }: TimelineViewProps) {
  const [viewMode, setViewMode] = useState<"day" | "hour">("day")
  const [selectedUser, setSelectedUser] = useState<string>("all")

  // Get unique users
  const users = useMemo(() => {
    const uniqueUsers = new Map()
    data.forEach((item) => {
      if (!uniqueUsers.has(item.pkUsuario)) {
        uniqueUsers.set(item.pkUsuario, item.nombreUsuario)
      }
    })
    return Array.from(uniqueUsers.entries()).map(([id, name]) => ({ id, name }))
  }, [data])

  // Filter data by selected user
  const filteredData = useMemo(() => {
    if (selectedUser === "all") return data
    return data.filter((item) => item.pkUsuario === selectedUser)
  }, [data, selectedUser])

  // Group data by day or hour
  const groupedData = useMemo(() => {
    const grouped = new Map()

    filteredData.forEach((item) => {
      const date = new Date(item.fechaConsulta)
      let key

      if (viewMode === "day") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          timeKey: key,
          displayTime: viewMode === "day" ? formatDayDisplay(key) : formatHourDisplay(key),
          events: [],
          totalEvents: 0,
          ownEvents: 0,
          otherEvents: 0,
          unknownEvents: 0,
          uniqueUsers: new Set(),
        })
      }

      const group = grouped.get(key)
      group.events.push(item)
      group.totalEvents++
      group.uniqueUsers.add(item.pkUsuario)

      if (item.esDesconocido) {
        group.unknownEvents++
      } else if (item.esConsultaPropia) {
        group.ownEvents++
      } else {
        group.otherEvents++
      }
    })

    // Convert to array and sort by date
    return Array.from(grouped.values()).sort((a, b) => {
      return a.timeKey.localeCompare(b.timeKey)
    })
  }, [filteredData, viewMode])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "day" | "hour")} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="day" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Por Día
            </TabsTrigger>
            <TabsTrigger value="hour" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Por Hora
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full sm:w-64">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {groupedData.length > 0 ? (
          groupedData.map((group, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>{group.displayTime}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-primary/10">
                      {group.totalEvents} consultas
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10">
                      {group.uniqueUsers.size} usuarios
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  <div className="flex gap-2 mt-1">
                    {group.ownEvents > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {group.ownEvents} propias
                      </Badge>
                    )}
                    {group.otherEvents > 0 && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {group.otherEvents} ajenas
                      </Badge>
                    )}
                    {group.unknownEvents > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {group.unknownEvents} desconocidas
                      </Badge>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.events.slice(0, 5).map((event: any, eventIndex: number) => (
                    <div
                      key={eventIndex}
                      className={`p-2 rounded-md text-sm ${
                        event.esDesconocido
                          ? "bg-yellow-50 dark:bg-yellow-950/30"
                          : event.esConsultaPropia
                            ? "bg-green-50 dark:bg-green-950/30"
                            : "bg-red-50 dark:bg-red-950/30"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{event.nombreUsuario}</div>
                        <div className="text-muted-foreground">{formatTime(event.fechaConsulta)}</div>
                      </div>
                      <div className="mt-1">
                        Consultó a:{" "}
                        {event.esDesconocido ? (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Desconocido (DNI: {event.dniConsulta})
                          </span>
                        ) : (
                          <span>
                            {event.apellidoConsulta} {event.nombreConsulta} (DNI: {event.dniConsulta})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {group.events.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground pt-2">
                      + {group.events.length - 5} consultas más en este período
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay datos para mostrar en la cronología</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function formatDayDisplay(dateStr: string) {
  try {
    const [year, month, day] = dateStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }

    return date.toLocaleDateString("es-ES", options)
  } catch (e) {
    return dateStr
  }
}

function formatHourDisplay(dateTimeStr: string) {
  try {
    const [dateStr, timeStr] = dateTimeStr.split(" ")
    const [year, month, day] = dateStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }

    return `${date.toLocaleDateString("es-ES", options)} - ${timeStr} hs`
  } catch (e) {
    return dateTimeStr
  }
}

function formatTime(dateTimeStr: string) {
  try {
    const [_, timeStr] = dateTimeStr.split(" ")
    return timeStr
  } catch (e) {
    return dateTimeStr
  }
}

