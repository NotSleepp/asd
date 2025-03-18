"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, UserRound, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AccessPatternViewProps {
  accessStats: any[]
}

export function AccessPatternView({ accessStats }: AccessPatternViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("totalAccesos")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedAccess, setSelectedAccess] = useState<any | null>(null)

  const itemsPerPage = 10

  // Filter data based on search term
  const filteredData = accessStats.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (item.nombre && item.nombre.toLowerCase().includes(searchLower)) ||
      (item.apellido && item.apellido.toLowerCase().includes(searchLower)) ||
      item.dni.includes(searchTerm)
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

  const handleAccessSelect = (access: any) => {
    setSelectedAccess(access)
  }

  const handleBackToList = () => {
    setSelectedAccess(null)
  }

  const getExposureLevelColor = (level: number) => {
    if (level >= 70) return "text-red-600 dark:text-red-400"
    if (level >= 40) return "text-amber-600 dark:text-amber-400"
    return "text-green-600 dark:text-green-400"
  }

  const getExposureLevelBg = (level: number) => {
    if (level >= 70) return "bg-red-600"
    if (level >= 40) return "bg-amber-600"
    return "bg-green-600"
  }

  if (selectedAccess) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackToList} className="mb-4">
          ← Volver a la lista
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Información de la Persona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="font-medium">{selectedAccess.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Apellido:</span>
                  <span className="font-medium">{selectedAccess.apellido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DNI:</span>
                  <span className="font-medium">{selectedAccess.dni}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Estadísticas de Acceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total accesos:</span>
                  <span className="font-medium">{selectedAccess.totalAccesos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accesos propios:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {selectedAccess.accesosPropios}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accesos por otros:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{selectedAccess.accesosAjenos}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios que Accedieron</CardTitle>
            <CardDescription>
              {selectedAccess.cantidadUsuariosQueAccedieron} usuarios diferentes han accedido a esta información
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAccess.usuariosQueAccedieron.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedAccess.usuariosQueAccedieron.map((usuario: string, index: number) => (
                  <div key={index} className="flex items-center p-2 border rounded">
                    <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{usuario}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No ha sido consultado por otros usuarios</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cronología de Accesos</CardTitle>
            <CardDescription>
              Accesos registrados entre {formatDisplayDate(selectedAccess.fechaPrimerAcceso)} y{" "}
              {formatDisplayDate(selectedAccess.fechaUltimoAcceso)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Primer acceso:</span>
                <span className="font-medium">{formatDisplayDate(selectedAccess.fechaPrimerAcceso)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último acceso:</span>
                <span className="font-medium">{formatDisplayDate(selectedAccess.fechaUltimoAcceso)}</span>
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
            placeholder="Buscar por nombre, apellido, DNI..."
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
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("apellido")}>
                  Apellido {sortField === "apellido" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("nombre")}>
                  Nombre {sortField === "nombre" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("dni")}>
                  DNI {sortField === "dni" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("totalAccesos")}>
                  Total Accesos {sortField === "totalAccesos" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("cantidadUsuariosQueAccedieron")}
                >
                  Usuarios Distintos{" "}
                  {sortField === "cantidadUsuariosQueAccedieron" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((access, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{access.apellido}</TableCell>
                    <TableCell>{access.nombre}</TableCell>
                    <TableCell>{access.dni}</TableCell>
                    <TableCell>{access.totalAccesos}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{access.cantidadUsuariosQueAccedieron}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleAccessSelect(access)}>
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
            {filteredData.length} personas
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

