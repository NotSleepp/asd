import * as XLSX from "xlsx"

export function exportToExcel(data: any[], userStats: any[], accessStats: any[], fileName: string) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Format raw data for Excel
  const formattedData = data.map((item) => ({
    Fecha: formatDateForExcel(item.fechaConsulta),
    "ID Usuario": item.pkUsuario,
    Legajo: item.legajo,
    "DNI Usuario": item.dniUsuario,
    "Nombre Usuario": item.nombreUsuario,
    "DNI Consultado": item.dniConsulta,
    Apellido: item.apellidoConsulta,
    Nombre: item.nombreConsulta,
    Tipo: item.esDesconocido ? "Desconocido" : item.esConsultaPropia ? "Propio" : "Ajeno",
    "Coincide DNI": item.coincideDNI ? "Sí" : "No",
  }))

  // Format user stats for Excel
  const formattedUserStats = userStats.map((user) => ({
    "ID Usuario": user.pkUsuario,
    Legajo: user.legajo,
    DNI: user.dniUsuario,
    Nombre: user.nombreUsuario,
    "Nivel de Sospecha (%)": user.nivelSospecha,
    "Total Consultas": user.totalConsultas,
    "Consultas Propias": user.consultasPropias,
    "Consultas Ajenas": user.consultasAjenas,
    "Consultas Desconocidas": user.consultasDesconocidas,
    "Personas Consultadas": user.cantidadPersonasConsultadas,
    "Días de Actividad": user.diasDeActividad,
    "Promedio Consultas por Día": user.promedioConsultasPorDia.toFixed(1),
    "Primera Consulta": formatDateForExcel(user.fechaPrimeraConsulta),
    "Última Consulta": formatDateForExcel(user.fechaUltimaConsulta),
    "Porcentaje Consultas Ajenas (%)": user.porcentajeConsultasAjenas.toFixed(1),
  }))

  // Format access stats for Excel
  const formattedAccessStats = accessStats.map((access) => ({
    DNI: access.dni,
    Apellido: access.apellido,
    Nombre: access.nombre,
    "Nivel de Exposición (%)": access.nivelExposicion,
    "Total Accesos": access.totalAccesos,
    "Accesos Propios": access.accesosPropios,
    "Accesos por Otros": access.accesosAjenos,
    "Usuarios Distintos": access.cantidadUsuariosQueAccedieron,
    "Primer Acceso": formatDateForExcel(access.fechaPrimerAcceso),
    "Último Acceso": formatDateForExcel(access.fechaUltimoAcceso),
    "Porcentaje Accesos Ajenos (%)": access.porcentajeAccesosAjenos.toFixed(1),
  }))

  // Create worksheets
  const rawDataWorksheet = XLSX.utils.json_to_sheet(formattedData)
  const userStatsWorksheet = XLSX.utils.json_to_sheet(formattedUserStats)
  const accessStatsWorksheet = XLSX.utils.json_to_sheet(formattedAccessStats)

  // Add the worksheets to the workbook
  XLSX.utils.book_append_sheet(workbook, rawDataWorksheet, "Datos Crudos")
  XLSX.utils.book_append_sheet(workbook, userStatsWorksheet, "Análisis de Usuarios")
  XLSX.utils.book_append_sheet(workbook, accessStatsWorksheet, "Análisis de Accesos")

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

function formatDateForExcel(dateStr: string) {
  try {
    const [datePart, timePart] = dateStr.split(" ")
    const [year, month, day] = datePart.split("-")
    return `${day}/${month}/${year} ${timePart || ""}`
  } catch (e) {
    return dateStr
  }
}

