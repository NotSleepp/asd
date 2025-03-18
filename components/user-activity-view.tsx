"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, UserRound, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UserActivityViewProps {
  userStats: any[]
}

export function UserActivityView({ userStats }: UserActivityViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("totalConsultas")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  const itemsPerPage = 10

  // Filter data based on search term
  const filteredData = userStats.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.nombreUsuario.toLowerCase().includes(searchLower) ||
      item.dniUsuario.includes(searchTerm) ||
      item.pkUsuario.includes(searchTerm) ||
      item.legajo.includes(searchTerm)
    )
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
  }

  const handleBackToList = () => {
    setSelectedUser(null)
  }

  const getSuspicionLevelColor = (level: number) => {
    if (level >= 70) return "text-red-600 dark:text-red-400"
    if (level >= 40) return "text-amber-600 dark:text-amber-400"
    return "text-green-600 dark:text-green-400"
  }

  const getSuspicionLevelBg = (level: number) => {
    if (level >= 70) return "bg-red-600"
    if (level >= 40) return "bg-amber-600"
    return "bg-green-600"
  }

  if (selectedUser) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackToList} className="mb-4">
          ← Volver a la lista
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Información del Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="font-medium">{selectedUser.nombreUsuario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DNI:</span>
                  <span className="font-medium">{selectedUser.dniUsuario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Legajo:</span>
                  <span className="font-medium">{selectedUser.legajo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Usuario:</span>
                  <span className="font-medium">{selectedUser.pkUsuario}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total consultas:</span>
                  <span className="font-medium">{selectedUser.totalConsultas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultas propias:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {selectedUser.consultasPropias}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultas ajenas:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{selectedUser.consultasAjenas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultas desconocidas:</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {selectedUser.consultasDesconocidas}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personas Consultadas</CardTitle>
            <CardDescription>
              Este usuario ha consultado información de {selectedUser.cantidadPersonasConsultadas} personas diferentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser.personasConsultadas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedUser.personasConsultadas.map((persona: string, index: number) => (
                  <div key={index} className="flex items-center p-2 border rounded">
                    <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{persona}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No ha consultado a otras personas</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cronología de Actividad</CardTitle>
            <CardDescription>
              Actividad registrada entre {formatDisplayDate(selectedUser.fechaPrimeraConsulta)} y{" "}
              {formatDisplayDate(selectedUser.fechaUltimaConsulta)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días con actividad:</span>
                <span className="font-medium">{selectedUser.diasDeActividad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Promedio de consultas por día:</span>
                <span className="font-medium">{selectedUser.promedioConsultasPorDia.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, legajo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("nombreUsuario")}>
                  Usuario {sortField === "nombreUsuario" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("dniUsuario")}>
                  DNI {sortField === "dniUsuario" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("totalConsultas")}>
                  Total Consultas {sortField === "totalConsultas" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("consultasAjenas")}>
                  Consultas Ajenas {sortField === "consultasAjenas" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("cantidadPersonasConsultadas")}
                >
                  Personas Consultadas{" "}
                  {sortField === "cantidadPersonasConsultadas" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{user.nombreUsuario}</TableCell>
                    <TableCell>{user.dniUsuario}</TableCell>
                    <TableCell>{user.totalConsultas}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{user.consultasAjenas}</span>
                        <span className="text-muted-foreground text-xs">
                          ({Math.round(user.porcentajeConsultasAjenas)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{user.cantidadPersonasConsultadas}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleUserSelect(user)}>
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No se encontraron resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
            {filteredData.length} usuarios
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDisplayDate(dateStr: string) {
  try {
    const [datePart, timePart] = dateStr.split(" ")
    const [year, month, day] = datePart.split("-")
    return `${day}/${month}/${year} ${timePart || ""}`
  } catch (e) {
    return dateStr
  }
}

