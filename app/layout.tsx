import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>Análisis de Consultas de Recibos de Sueldo</title>
        <meta name="description" content="Sistema avanzado para analizar patrones de consulta de recibos de sueldo" />
      </head>
      <body className={inter.className}>
          {children}
      </body>
    </html>
  )
}

