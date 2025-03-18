"use client"

import { useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportToExcel } from "@/lib/excel-export"
import { UserActivityView } from "@/components/user-activity-view"
import { AccessPatternView } from "@/components/access-pattern-view"
import { TimelineView } from "@/components/timeline-view"
import { parseTextData } from "@/lib/data-parser"
import { Card, CardContent } from "@/components/ui/card"
import { DataSummary } from "@/components/data-summary"
import { UserHierarchyView } from "@/components/user-hierarchy-view"
import { AdvancedAnalysis } from "@/components/advanced-analysis"
import { AlertTriangle, FileSpreadsheet, Info, BarChart3, Table2, Users, UserRound, Shield, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  const [parsedData, setParsedData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userStats, setUserStats] = useState<any[]>([])
  const [accessStats, setAccessStats] = useState<any[]>([])

  const handleFileUpload = async (content: string) => {
    setIsLoading(true)
    try {
      // Parse the text file content
      const data = parseTextData(content)
      setParsedData(data)

      // Calculate statistics
      calculateStats(data)
    } catch (error) {
      console.error("Error parsing file:", error)
      alert("Error parsing file. Please check the format.")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (data: any[]) => {
    // Group by user
    const userMap = new Map()
    data.forEach((item) => {
      if (!userMap.has(item.pkUsuario)) {
        userMap.set(item.pkUsuario, {
          pkUsuario: item.pkUsuario,
          legajo: item.legajo,
          dniUsuario: item.dniUsuario,
          nombreUsuario: item.nombreUsuario,
          totalConsultas: 0,
          consultasPropias: 0,
          consultasAjenas: 0,
          consultasDesconocidas: 0,
          personasConsultadas: new Set(),
          fechaPrimeraConsulta: null,
          fechaUltimaConsulta: null,
          consultasPorDia: {},
        })
      }

      const userStat = userMap.get(item.pkUsuario)
      userStat.totalConsultas++

      const fecha = item.fechaConsulta.split(" ")[0]
      userStat.consultasPorDia[fecha] = (userStat.consultasPorDia[fecha] || 0) + 1

      if (!userStat.fechaPrimeraConsulta || new Date(item.fechaConsulta) < new Date(userStat.fechaPrimeraConsulta)) {
        userStat.fechaPrimeraConsulta = item.fechaConsulta
      }

      if (!userStat.fechaUltimaConsulta || new Date(item.fechaConsulta) > new Date(userStat.fechaUltimaConsulta)) {
        userStat.fechaUltimaConsulta = item.fechaConsulta
      }

      if (item.esDesconocido) {
        userStat.consultasDesconocidas++
      } else if (item.dniUsuario === item.dniConsulta) {
        userStat.consultasPropias++
      } else {
        userStat.consultasAjenas++
        if (!item.esDesconocido) {
          userStat.personasConsultadas.add(`${item.apellidoConsulta} ${item.nombreConsulta} (${item.dniConsulta})`)
        }
      }
    })

    // Convert to array and calculate additional metrics
    const userStatsArray = Array.from(userMap.values()).map((user) => ({
      ...user,
      personasConsultadas: Array.from(user.personasConsultadas),
      cantidadPersonasConsultadas: user.personasConsultadas.size,
      diasDeActividad: Object.keys(user.consultasPorDia).length,
      promedioConsultasPorDia: user.totalConsultas / Object.keys(user.consultasPorDia).length,
      porcentajeConsultasAjenas: (user.consultasAjenas / user.totalConsultas) * 100,
      nivelSospecha: calculateSuspicionLevel(user),
    }))

    // Sort by suspicion level (highest first)
    userStatsArray.sort((a, b) => b.nivelSospecha - a.nivelSospecha)

    setUserStats(userStatsArray)

    // Calculate access patterns
    const accessMap = new Map()
    data.forEach((item) => {
      if (item.esDesconocido) return

      const accessKey = item.dniConsulta
      if (!accessMap.has(accessKey)) {
        accessMap.set(accessKey, {
          dni: item.dniConsulta,
          apellido: item.apellidoConsulta,
          nombre: item.nombreConsulta,
          totalAccesos: 0,
          accesosPropios: 0,
          accesosAjenos: 0,
          usuariosQueAccedieron: new Set(),
          fechaPrimerAcceso: null,
          fechaUltimoAcceso: null,
        })
      }

      const accessStat = accessMap.get(accessKey)
      accessStat.totalAccesos++

      if (!accessStat.fechaPrimerAcceso || new Date(item.fechaConsulta) < new Date(accessStat.fechaPrimerAcceso)) {
        accessStat.fechaPrimerAcceso = item.fechaConsulta
      }

      if (!accessStat.fechaUltimoAcceso || new Date(item.fechaConsulta) > new Date(accessStat.fechaUltimoAcceso)) {
        accessStat.fechaUltimoAcceso = item.fechaConsulta
      }

      if (item.dniUsuario === item.dniConsulta) {
        accessStat.accesosPropios++
      } else {
        accessStat.accesosAjenos++
        accessStat.usuariosQueAccedieron.add(`${item.nombreUsuario} (${item.dniUsuario})`)
      }
    })

    // Convert to array and calculate additional metrics
    const accessStatsArray = Array.from(accessMap.values()).map((access) => ({
      ...access,
      usuariosQueAccedieron: Array.from(access.usuariosQueAccedieron),
      cantidadUsuariosQueAccedieron: access.usuariosQueAccedieron.size,
      porcentajeAccesosAjenos: (access.accesosAjenos / access.totalAccesos) * 100,
      nivelExposicion: calculateExposureLevel(access),
    }))

    // Sort by exposure level (highest first)
    accessStatsArray.sort((a, b) => b.nivelExposicion - a.nivelExposicion)

    setAccessStats(accessStatsArray)
  }

  const handleExport = () => {
    if (parsedData.length === 0) {
      alert("No hay datos para exportar")
      return
    }

    exportToExcel(parsedData, userStats, accessStats, "analisis_consultas_recibos")
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Análisis de Consultas de Recibos de Sueldo</h1>

      <div className="grid gap-6">
        <FileUploader onFileUpload={handleFileUpload} />

        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-lg font-medium">Procesando datos...</p>
                <p className="text-sm text-muted-foreground">Esto puede tomar unos momentos</p>
              </div>
            </CardContent>
          </Card>
        )}

        {parsedData.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Datos Procesados ({parsedData.length} registros)</h2>
              <Button onClick={handleExport} className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar a Excel
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Información importante</AlertTitle>
              <AlertDescription>
                Este análisis identifica patrones de acceso a recibos de sueldo. Los usuarios con alto nivel de sospecha
                han consultado múltiples recibos ajenos. Los perfiles con alto nivel de exposición han sido consultados
                por múltiples usuarios diferentes.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-7">
                <TabsTrigger value="summary" className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="hierarchy" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Jerarquía
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1">
                  <UserRound className="h-4 w-4" />
                  Usuarios
                </TabsTrigger>
                <TabsTrigger value="access" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Accesos
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Cronología
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Análisis
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-1">
                  <Table2 className="h-4 w-4" />
                  Datos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <DataSummary data={parsedData} userStats={userStats} accessStats={accessStats} />
              </TabsContent>

              <TabsContent value="hierarchy" className="mt-4">
                <UserHierarchyView data={parsedData} userStats={userStats} />
              </TabsContent>

              <TabsContent value="users" className="mt-4">
                <UserActivityView userStats={userStats} />
              </TabsContent>

              <TabsContent value="access" className="mt-4">
                <AccessPatternView accessStats={accessStats} />
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <TimelineView data={parsedData} />
              </TabsContent>

              <TabsContent value="analysis" className="mt-4">
                <AdvancedAnalysis data={parsedData} userStats={userStats} accessStats={accessStats} />
              </TabsContent>

              <TabsContent value="data" className="mt-4">
                <DataTable data={parsedData} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </main>
  )
}

function calculateSuspicionLevel(user: any) {
  // Calculate suspicion level based on various factors
  let score = 0

  // Base score from percentage of queries to others
  score += user.porcentajeConsultasAjenas / 10

  // Number of different people consulted
  score += Math.min(user.cantidadPersonasConsultadas * 2, 20)

  // High frequency of queries in a single day
  const maxQueriesPerDay = Math.max(...(Object.values(user.consultasPorDia) as number[]))
  if (maxQueriesPerDay > 10) score += 10
  else if (maxQueriesPerDay > 5) score += 5

  // Unknown queries
  score += user.consultasDesconocidas * 0.5

  return Math.min(Math.round(score), 100)
}

function calculateExposureLevel(access: any) {
  // Calculate exposure level based on various factors
  let score = 0

  // Base score from percentage of accesses by others
  score += access.porcentajeAccesosAjenos / 10

  // Number of different users who accessed
  score += Math.min(access.cantidadUsuariosQueAccedieron * 5, 50)

  // Total number of accesses
  if (access.totalAccesos > 10) score += 15
  else if (access.totalAccesos > 5) score += 10
  else if (access.totalAccesos > 2) score += 5

  return Math.min(Math.round(score), 100)
}

