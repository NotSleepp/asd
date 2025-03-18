"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DataTableProps {
  data: any[]
}

export function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("fechaConsulta")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const itemsPerPage = 15

  // Filter data based on search term
  const filteredData = data.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.nombreUsuario.toLowerCase().includes(searchLower) ||
      item.dniUsuario.includes(searchTerm) ||
      item.nombreConsulta.toLowerCase().includes(searchLower) ||
      item.apellidoConsulta.toLowerCase().includes(searchLower) ||
      item.dniConsulta.includes(searchTerm) ||
      item.fechaConsulta.includes(searchTerm)
    )
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortField === "fechaConsulta") {
      return sortDirection === "asc"
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime()
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue
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
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, fecha..."
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
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("fechaConsulta")}>
                  Fecha {sortField === "fechaConsulta" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("pkUsuario")}>
                  Usuario {sortField === "pkUsuario" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("dniUsuario")}>
                  DNI Usuario {sortField === "dniUsuario" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("dniConsulta")}>
                  DNI Consultado {sortField === "dniConsulta" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("apellidoConsulta")}>
                  Apellido {sortField === "apellidoConsulta" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort("nombreConsulta")}>
                  Nombre {sortField === "nombreConsulta" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="whitespace-nowrap">Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={index}
                    className={
                      item.esDesconocido
                        ? "bg-yellow-50 dark:bg-yellow-950/30"
                        : item.esConsultaPropia
                          ? "bg-green-50 dark:bg-green-950/30"
                          : "bg-red-50 dark:bg-red-950/30"
                    }
                  >
                    <TableCell className="whitespace-nowrap">{formatDisplayDate(item.fechaConsulta)}</TableCell>
                    <TableCell className="font-medium">{item.nombreUsuario}</TableCell>
                    <TableCell>{item.dniUsuario}</TableCell>
                    <TableCell className={item.coincideDNI ? "font-bold" : ""}>{item.dniConsulta}</TableCell>
                    <TableCell>{item.apellidoConsulta}</TableCell>
                    <TableCell>{item.nombreConsulta}</TableCell>
                    <TableCell>
                      {item.esDesconocido ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Desconocido
                        </Badge>
                      ) : item.esConsultaPropia ? (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-800"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Propio
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-800"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Ajeno
                        </Badge>
                      )}
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
            {filteredData.length} registros
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

