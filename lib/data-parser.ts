export function parseTextData(text: string) {
  const sections = text.split("---").filter((section) => section.trim() !== "")

  const parsedData: any[] = []

  sections.forEach((section) => {
    const lines = section.trim().split("\n")

    // Parse the user info line
    const userInfoLine = lines[0]
    const userInfoMatch = userInfoLine.match(/Pkusuario: (\d+) - Legajo: (\d+) - DNI: (\d+) - Nombre: (.+)/)

    if (!userInfoMatch) return

    const [_, pkUsuario, legajo, dniUsuario, nombreUsuario] = userInfoMatch

    // Parse each consultation line
    for (let i = 1; i < lines.length; i++) {
      const consultLine = lines[i]
      const consultMatch = consultLine.match(/DNI: (\d+) - Apellido: (.+) - Nombre: (.+) - Fecha: (.+)/)

      if (!consultMatch) continue

      const [__, dniConsulta, apellidoConsulta, nombreConsulta, fechaConsulta] = consultMatch

      // Create a structured record
      parsedData.push({
        pkUsuario,
        legajo,
        dniUsuario,
        nombreUsuario,
        dniConsulta,
        apellidoConsulta: apellidoConsulta.trim(),
        nombreConsulta: nombreConsulta.trim(),
        fechaConsulta: formatDate(fechaConsulta.trim()),
        esDesconocido: apellidoConsulta.trim() === "Desconocido" || nombreConsulta.trim() === "Desconocido",
        coincideDNI: dniUsuario === dniConsulta,
        esConsultaPropia: dniUsuario === dniConsulta,
        timestamp: new Date(formatDate(fechaConsulta.trim())).getTime(),
      })
    }
  })

  // Sort by date (newest first)
  return parsedData.sort((a, b) => new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime())
}

function formatDate(dateStr: string) {
  try {
    const [date, time] = dateStr.split(" ")
    const [day, month, year] = date.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} ${time || "00:00:00"}`
  } catch (e) {
    return dateStr
  }
}

