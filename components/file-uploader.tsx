"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (content: string) => void
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    if (file.type !== "text/plain") {
      alert("Por favor, sube un archivo de texto (.txt)")
      return
    }

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      onFileUpload(content)
    }
    reader.readAsText(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={`border-2 ${isDragging ? "border-primary" : "border-dashed"}`}>
      <CardContent className="p-6">
        <div
          className="flex flex-col items-center justify-center py-8 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {fileName ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium">{fileName}</p>
              <Button variant="outline" size="sm" onClick={handleButtonClick} className="mt-2">
                Cambiar archivo
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold">Arrastra y suelta tu archivo de logs</h3>
              <p className="text-sm text-muted-foreground mb-4">o haz clic para seleccionar un archivo de texto</p>
              <Button onClick={handleButtonClick}>Seleccionar archivo</Button>
            </>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt" className="hidden" />
        </div>
      </CardContent>
    </Card>
  )
}

