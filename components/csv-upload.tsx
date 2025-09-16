"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { parseCSV, validateCSVStructure } from "@/lib/csv-parser"
import type { StudentData } from "@/types/student"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CSVUploadProps {
  onDataLoaded: (data: StudentData[]) => void
}

export function CSVUpload({ onDataLoaded }: CSVUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const data = await parseCSV(file)

        if (!validateCSVStructure(data)) {
          throw new Error("Invalid CSV structure. Please ensure all required columns are present.")
        }

        if (data.length === 0) {
          throw new Error("No valid student data found in the CSV file.")
        }

        onDataLoaded(data)
        setSuccess(`Successfully loaded ${data.length} student records!`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV file")
      } finally {
        setIsLoading(false)
      }
    },
    [onDataLoaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    disabled: isLoading,
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Student Data
        </CardTitle>
        <CardDescription>Upload a CSV file containing student cognitive skills and performance data</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the CSV file here...</p>
            ) : (
              <>
                <p className="text-lg font-medium">{isLoading ? "Processing..." : "Drag & drop a CSV file here"}</p>
                <p className="text-sm text-muted-foreground">or click to select a file</p>
                <Button variant="outline" disabled={isLoading}>
                  Choose File
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium mb-2">Required CSV columns:</p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div>
              <strong>Student ID:</strong> student_id (integer)
            </div>
            <div>
              <strong>Name:</strong> name (text)
            </div>
            <div>
              <strong>Class:</strong> class (text)
            </div>
            <div>
              <strong>Comprehension:</strong> comprehension (0.0-1.0)
            </div>
            <div>
              <strong>Attention:</strong> attention (0.0-1.0)
            </div>
            <div>
              <strong>Focus:</strong> focus (0.0-1.0)
            </div>
            <div>
              <strong>Retention:</strong> retention (0.0-1.0)
            </div>
            <div>
              <strong>Assessment Score:</strong> assessment_score (0-100)
            </div>
            <div>
              <strong>Engagement Time:</strong> engagement_time (minutes)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
