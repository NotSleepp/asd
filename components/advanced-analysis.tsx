"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, FileText, Calendar, Clock, UserRound, Activity } from "lucide-react"

interface AdvancedAnalysisProps {
  data: any[]
  userStats: any[]
  accessStats: any[]
}

export function AdvancedAnalysis({ data, userStats, accessStats }: AdvancedAnalysisProps) {
  // Calcular estadísticas para gráficos
  const chartData = useMemo(() => {
    // Actividad por día de la semana
    const dayOfWeekMap = new Map()
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

    data.forEach((item) => {
      const date = new Date(item.fechaConsulta)
      const dayOfWeek = date.getDay()
      const dayName = dayNames[dayOfWeek]

      if (!dayOfWeekMap.has(dayName)) {
        dayOfWeekMap.set(dayName, {
          name: dayName,
          total: 0,
          propias: 0,
          ajenas: 0,
          desconocidas: 0,
          order: dayOfWeek,
        })
      }

      const dayStats = dayOfWeekMap.get(dayName)
      dayStats.total++

      if (item.esDesconocido) {
        dayStats.desconocidas++
      } else if (item.esConsultaPropia) {
        dayStats.propias++
      } else {
        dayStats.ajenas++
      }
    })

    const activityByDayOfWeek = Array.from(dayOfWeekMap.values()).sort((a, b) => a.order - b.order)

    // Actividad por hora
    const hourMap = new Map()

    for (let i = 0; i < 24; i++) {
      hourMap.set(i, {
        name: `${i}:00`,
        hour: i,
        total: 0,
        propias: 0,
        ajenas: 0,
        desconocidas: 0,
      })
    }

    data.forEach((item) => {
      const date = new Date(item.fechaConsulta)
      const hour = date.getHours()

      const hourStats = hourMap.get(hour)
      hourStats.total++

      if (item.esDesconocido) {
        hourStats.desconocidas++
      } else if (item.esConsultaPropia) {
        hourStats.propias++
      } else {
        hourStats.ajenas++
      }
    })

    const activityByHour = Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour)

    // Distribución de tipos de consulta
    const queryTypeData = [
      { name: "Propias", value: data.filter((item) => item.esConsultaPropia).length },
      { name: "Ajenas", value: data.filter((item) => !item.esDesconocido && !item.esConsultaPropia).length },
      { name: "Desconocidas", value: data.filter((item) => item.esDesconocido).length },
    ]

    // Top usuarios por número de consultas
    const topUsersByQueries = [...userStats]
      .sort((a, b) => b.totalConsultas - a.totalConsultas)
      .slice(0, 10)
      .map((user) => ({
        name: user.nombreUsuario,
        total: user.totalConsultas,
        propias: user.consultasPropias,
        ajenas: user.consultasAjenas,
        desconocidas: user.consultasDesconocidas,
      }))

    // Top perfiles por número de accesos
    const topProfilesByAccesses = [...accessStats]
      .sort((a, b) => b.totalAccesos - a.totalAccesos)
      .slice(0, 10)
      .map((profile) => ({
        name: `${profile.apellido} ${profile.nombre}`,
        total: profile.totalAccesos,
        propios: profile.accesosPropios,
        ajenos: profile.accesosAjenos,
      }))

    return {
      activityByDayOfWeek,
      activityByHour,
      queryTypeData,
      topUsersByQueries,
      topProfilesByAccesses,
    }
  }, [data, userStats, accessStats])

  const COLORS = ["#4ade80", "#f87171", "#facc15"]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3">
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Actividad
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-1">
            <UserRound className="h-4 w-4" />
            Perfiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Actividad por Día de la Semana
                </CardTitle>
                <CardDescription>Distribución de consultas según el día de la semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.activityByDayOfWeek} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="propias" name="Consultas Propias" stackId="a" fill="#4ade80" />
                      <Bar dataKey="ajenas" name="Consultas Ajenas" stackId="a" fill="#f87171" />
                      <Bar dataKey="desconocidas" name="Consultas Desconocidas" stackId="a" fill="#facc15" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Actividad por Hora del Día
                </CardTitle>
                <CardDescription>Distribución de consultas según la hora del día</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.activityByHour} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="propias" name="Consultas Propias" stackId="a" fill="#4ade80" />
                      <Bar dataKey="ajenas" name="Consultas Ajenas" stackId="a" fill="#f87171" />
                      <Bar dataKey="desconocidas" name="Consultas Desconocidas" stackId="a" fill="#facc15" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Distribución de Tipos de Consulta
                </CardTitle>
                <CardDescription>Proporción de consultas propias, ajenas y desconocidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.queryTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.queryTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} consultas`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#4ade80] mr-2"></div>
                    <span className="text-sm">Propias</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#f87171] mr-2"></div>
                    <span className="text-sm">Ajenas</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#facc15] mr-2"></div>
                    <span className="text-sm">Desconocidas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Top 10 Usuarios por Cantidad de Consultas
              </CardTitle>
              <CardDescription>Usuarios que realizaron más consultas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.topUsersByQueries}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="propias" name="Consultas Propias" stackId="a" fill="#4ade80" />
                    <Bar dataKey="ajenas" name="Consultas Ajenas" stackId="a" fill="#f87171" />
                    <Bar dataKey="desconocidas" name="Consultas Desconocidas" stackId="a" fill="#facc15" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" />
                Top 10 Perfiles más Consultados
              </CardTitle>
              <CardDescription>Perfiles que recibieron más consultas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.topProfilesByAccesses}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="propios" name="Accesos Propios" stackId="a" fill="#4ade80" />
                    <Bar dataKey="ajenos" name="Accesos por Otros" stackId="a" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

