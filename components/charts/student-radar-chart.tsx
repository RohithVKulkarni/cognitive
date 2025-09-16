"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StudentData } from "@/types/student"
import { User } from "lucide-react"

interface StudentRadarChartProps {
  data: StudentData[]
}

export function StudentRadarChart({ data }: StudentRadarChartProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(data[0]?.student_id.toString() || "")

  console.log("[v0] StudentRadarChart received data:", data?.length || 0, "students")
  console.log("[v0] Selected student ID:", selectedStudentId)

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Individual Student Cognitive Profile
          </CardTitle>
          <CardDescription>Radar chart showing cognitive skills breakdown for a selected student</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available for chart
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedStudent = data.find((student) => student.student_id.toString() === selectedStudentId)

  const radarData = selectedStudent
    ? [
        {
          skill: "Comprehension",
          value: Math.round(selectedStudent.comprehension * 100),
          fullMark: 100,
        },
        {
          skill: "Attention",
          value: Math.round(selectedStudent.attention * 100),
          fullMark: 100,
        },
        {
          skill: "Focus",
          value: Math.round(selectedStudent.focus * 100),
          fullMark: 100,
        },
        {
          skill: "Retention",
          value: Math.round(selectedStudent.retention * 100),
          fullMark: 100,
        },
      ]
    : []

  console.log("[v0] Radar data calculated:", radarData)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Individual Student Cognitive Profile
        </CardTitle>
        <CardDescription>Cognitive skills breakdown for a selected student</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {data.map((student) => (
                <SelectItem key={student.student_id} value={student.student_id.toString()}>
                  {student.name} ({student.class}) - Score: {student.assessment_score}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStudent && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
              <p className="text-sm text-muted-foreground">
                Class: {selectedStudent.class} | Assessment Score: {selectedStudent.assessment_score}% | Engagement:{" "}
                {selectedStudent.engagement_time}m
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {radarData.map((item) => (
                <div key={item.skill} className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - item.value / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-foreground">{item.value}%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground">{item.skill}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Comprehension:</span>
                  <span className="font-medium">{Math.round(selectedStudent.comprehension * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Attention:</span>
                  <span className="font-medium">{Math.round(selectedStudent.attention * 100)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Focus:</span>
                  <span className="font-medium">{Math.round(selectedStudent.focus * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Retention:</span>
                  <span className="font-medium">{Math.round(selectedStudent.retention * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
