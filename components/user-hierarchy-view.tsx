"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, UserRound, Users, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UserHierarchyViewProps {
  data: any[]
  userStats: any[]
}

export function UserHierarchyView({ data, userStats }: UserHierarchyViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())

  // Filter users based on search term
  const filteredUsers = userStats.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.nombreUsuario.toLowerCase().includes(searchLower) ||
      user.dniUsuario.includes(searchTerm) ||
      user.pkUsuario.includes(searchTerm) ||
      user.legajo.includes(searchTerm)
    )
  })

  // Sort users by total consultations (highest first)
  const sortedUsers = [...filteredUsers].sort((a, b) => b.totalConsultas - a.totalConsultas)

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  // Get all consultations for a specific user
  const getUserConsultations = (userId: string) => {
    return data
      .filter((item) => item.pkUsuario === userId)
      .sort((a, b) => new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime())
  }

  // Group consultations by DNI
  const groupConsultationsByDni = (consultations: any[]) => {
    const groups = new Map()

    consultations.forEach((item) => {
      const key = item.dniConsulta
      if (!groups.has(key)) {
        groups.set(key, {
          dni: item.dniConsulta,
          apellido: item.apellidoConsulta,
          nombre: item.nombreConsulta,
          esDesconocido: item.esDesconocido,
          esPropio: item.esConsultaPropia,
          consultations: [],
        })
      }

      groups.get(key).consultations.push(item)
    })

    return Array.from(groups.values()).sort((a, b) => {
      // Sort by: own profile first, then known profiles, then unknown profiles
      if (a.esPropio && !b.esPropio) return -1
      if (!a.esPropio && b.esPropio) return 1
      if (a.esDesconocido && !b.esDesconocido) return 1
      if (!a.esDesconocido && b.esDesconocido) return -1

      // Then by number of consultations (descending)
      return b.consultations.length - a.consultations.length
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuario por nombre, DNI, legajo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-4">
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user) => {
            const userConsultations = getUserConsultations(user.pkUsuario)
            const groupedConsultations = groupConsultationsByDni(userConsultations)
            const isExpanded = expandedUsers.has(user.pkUsuario)

            return (
              <Card key={user.pkUsuario}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <UserRound className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{user.nombreUsuario}</CardTitle>
                      <CardDescription className="mt-1">
                        DNI: {user.dniUsuario} | Legajo: {user.legajo} | ID: {user.pkUsuario}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="bg-primary/10">
                      <Users className="h-3 w-3 mr-1" />
                      {user.totalConsultas} consultas totales
                    </Badge>

                    {user.consultasPropias > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {user.consultasPropias} propias
                      </Badge>
                    )}

                    {user.consultasAjenas > 0 && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {user.consultasAjenas} ajenas
                      </Badge>
                    )}

                    {user.consultasDesconocidas > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {user.consultasDesconocidas} desconocidas
                      </Badge>
                    )}

                    <Badge variant="outline" className="bg-primary/10">
                      {user.cantidadPersonasConsultadas} personas distintas
                    </Badge>
                  </div>
                </CardHeader>

                <div>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center py-1 h-8"
                    onClick={() => toggleUserExpanded(user.pkUsuario)}
                  >
                    {isExpanded ? (
                      <div className="flex items-center">
                        <span className="mr-1 text-sm">Ocultar perfiles consultados</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-1 text-sm">Ver {groupedConsultations.length} perfiles consultados</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>

                  {isExpanded && (
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                          {groupedConsultations.map((group, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-md border ${
                                group.esDesconocido
                                  ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
                                  : group.esPropio
                                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                                    : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium text-lg flex items-center">
                                    {group.esDesconocido ? (
                                      <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600 dark:text-yellow-400" />
                                    ) : group.esPropio ? (
                                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <AlertTriangle className="h-4 w-4 mr-1 text-red-600 dark:text-red-400" />
                                    )}

                                    {group.esDesconocido
                                      ? `Desconocido (DNI: ${group.dni})`
                                      : `${group.apellido} ${group.nombre}`}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    DNI: {group.dni} | {group.esPropio ? "Perfil propio" : "Perfil ajeno"}
                                  </div>
                                </div>
                                <Badge>{group.consultations.length} consultas</Badge>
                              </div>

                              <div className="space-y-2 mt-3">
                                <div className="text-sm font-medium">Historial de consultas:</div>
                                {group.consultations.map((item: any, itemIndex: number) => (
                                  <div
                                    key={itemIndex}
                                    className="text-sm flex justify-between border-b pb-1 last:border-0"
                                  >
                                    <span>{formatDisplayDate(item.fechaConsulta)}</span>
                                    <span className="text-muted-foreground">
                                      {formatDisplayTime(item.fechaConsulta)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  )}
                </div>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No se encontraron usuarios que coincidan con la búsqueda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function formatDisplayDate(dateStr: string) {
  try {
    const [datePart, _] = dateStr.split(" ")
    const [year, month, day] = datePart.split("-")
    return `${day}/${month}/${year}`
  } catch (e) {
    return dateStr
  }
}

function formatDisplayTime(dateStr: string) {
  try {
    const [_, timePart] = dateStr.split(" ")
    return timePart || ""
  } catch (e) {
    return ""
  }
}

