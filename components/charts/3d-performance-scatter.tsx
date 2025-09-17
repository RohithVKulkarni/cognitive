"use client"

import { useState, useMemo } from "react"
import type { StudentData } from "@/types/student"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react"

interface ThreeDPerformanceScatterProps {
  data: StudentData[]
}

export function ThreeDPerformanceScatter({ data }: ThreeDPerformanceScatterProps) {
  const [rotation, setRotation] = useState({ x: 15, y: 45 })
  const [zoom, setZoom] = useState(1)
  type StudentDataWithPerformance = StudentData & { performance: number }

  const [selectedStudent, setSelectedStudent] = useState<StudentDataWithPerformance | null>(null)

  const processedData = useMemo(() => {
    return data.map((student) => ({
      ...student,
      // Convert to 3D coordinates (normalized to 0-100 range)
      x: student.attention * 100,
      y: student.focus * 100,
      z: student.assessment_score,
      // Color based on overall performance
      performance: (student.comprehension + student.attention + student.focus + student.retention) / 4,
    }))
  }, [data])

  const project3DTo2D = (x: number, y: number, z: number) => {
    // Simple 3D to 2D projection with rotation
    const radX = (rotation.x * Math.PI) / 180
    const radY = (rotation.y * Math.PI) / 180

    // Apply rotation
    const cosX = Math.cos(radX)
    const sinX = Math.sin(radX)
    const cosY = Math.cos(radY)
    const sinY = Math.sin(radY)

    const rotatedY = y * cosX - z * sinX
    const rotatedZ = y * sinX + z * cosX
    const rotatedX = x * cosY + rotatedZ * sinY
    const finalZ = -x * sinY + rotatedZ * cosY

    // Project to 2D with perspective
    const perspective = 300
    const scale = (perspective / (perspective + finalZ)) * zoom

    return {
      x: rotatedX * scale,
      y: rotatedY * scale,
      scale: scale,
    }
  }

  const getPerformanceColor = (performance: number) => {
    // Color gradient from red (low) to green (high)
    const hue = performance * 120 // 0 = red, 120 = green
    return `hsl(${hue}, 70%, 50%)`
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3D Performance Scatter Plot</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom((prev) => Math.min(prev + 0.2, 2))}>
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRotation((prev) => ({ ...prev, y: prev.y + 15 }))}>
              <RotateCw className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Interactive 3D visualization: Attention (X) × Focus (Y) × Assessment Score (Z)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="relative h-96 bg-muted/10 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseMove={(e) => {
            if (e.buttons === 1) {
              // Left mouse button pressed
              const rect = e.currentTarget.getBoundingClientRect()
              const centerX = rect.width / 2
              const centerY = rect.height / 2
              const deltaX = e.clientX - rect.left - centerX
              const deltaY = e.clientY - rect.top - centerY

              setRotation((prev) => ({
                x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
                y: prev.y + deltaX * 0.5,
              }))
            }
          }}
        >
          {/* 3D Axes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-muted-foreground" />
              </marker>
            </defs>

            {/* X-axis (Attention) */}
            <line
              x1="50%"
              y1="50%"
              x2="80%"
              y2="70%"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500"
              markerEnd="url(#arrowhead)"
            />
            <text x="82%" y="72%" className="text-xs fill-blue-500">
              Attention
            </text>

            {/* Y-axis (Focus) */}
            <line
              x1="50%"
              y1="50%"
              x2="20%"
              y2="30%"
              stroke="currentColor"
              strokeWidth="2"
              className="text-green-500"
              markerEnd="url(#arrowhead)"
            />
            <text x="15%" y="28%" className="text-xs fill-green-500">
              Focus
            </text>

            {/* Z-axis (Assessment Score) */}
            <line
              x1="50%"
              y1="50%"
              x2="50%"
              y2="20%"
              stroke="currentColor"
              strokeWidth="2"
              className="text-purple-500"
              markerEnd="url(#arrowhead)"
            />
            <text x="52%" y="18%" className="text-xs fill-purple-500">
              Score
            </text>
          </svg>

          {/* Data points */}
          <div className="absolute inset-0 flex items-center justify-center">
            {processedData.map((student) => {
              const projected = project3DTo2D(student.x - 50, student.y - 50, student.z - 50)
              return (
                <div
                  key={student.student_id}
                  className="absolute w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-150 hover:z-10"
                  style={{
                    left: `calc(50% + ${projected.x}px)`,
                    top: `calc(50% - ${projected.y}px)`,
                    backgroundColor: getPerformanceColor(student.performance),
                    transform: `translate(-50%, -50%) scale(${Math.max(0.5, projected.scale)})`,
                    zIndex: Math.round(projected.scale * 10),
                  }}
                  onClick={() => setSelectedStudent(student)}
                  title={`${student.name}: Attention ${(student.attention * 100).toFixed(1)}%, Focus ${(student.focus * 100).toFixed(1)}%, Score ${student.assessment_score}%`}
                />
              )
            })}
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
            Drag to rotate • Use zoom buttons
          </div>
        </div>

        {selectedStudent && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium">{selectedStudent.name}</h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div>Attention: {(selectedStudent.attention * 100).toFixed(1)}%</div>
              <div>Focus: {(selectedStudent.focus * 100).toFixed(1)}%</div>
              <div>Assessment: {selectedStudent.assessment_score}%</div>
              <div>Overall: {(selectedStudent.performance * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPerformanceColor(0.8) }}></div>
            <span>High Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPerformanceColor(0.5) }}></div>
            <span>Medium Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPerformanceColor(0.2) }}></div>
            <span>Low Performance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
