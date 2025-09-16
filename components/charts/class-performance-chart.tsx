"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StudentData } from "@/types/student"
import { GraduationCap } from "lucide-react"

interface ClassPerformanceChartProps {
  data: StudentData[]
}

export function ClassPerformanceChart({ data }: ClassPerformanceChartProps) {
  console.log("[v0] ClassPerformanceChart received data:", data?.length || 0, "students")

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Class Performance Comparison
          </CardTitle>
          <CardDescription>Average assessment scores and engagement time by class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available for chart
          </div>
        </CardContent>
      </Card>
    )
  }

  const classData = data.reduce(
    (acc, student) => {
      if (!acc[student.class]) {
        acc[student.class] = {
          students: [],
          totalScore: 0,
          totalEngagement: 0,
        }
      }
      acc[student.class].students.push(student)
      acc[student.class].totalScore += student.assessment_score
      acc[student.class].totalEngagement += student.engagement_time
      return acc
    },
    {} as Record<string, { students: StudentData[]; totalScore: number; totalEngagement: number }>,
  )

  const chartData = Object.entries(classData)
    .map(([className, data]) => ({
      class: className,
      averageScore: Math.round(data.totalScore / data.students.length),
      averageEngagement: Math.round(data.totalEngagement / data.students.length),
      studentCount: data.students.length,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)

  console.log("[v0] Class chart data calculated:", chartData)

  const maxScore = Math.max(...chartData.map((d) => d.averageScore))
  const maxEngagement = Math.max(...chartData.map((d) => d.averageEngagement))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Class Performance Comparison
        </CardTitle>
        <CardDescription>Average assessment scores and engagement time by class</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {chartData.map((classInfo) => (
            <div key={classInfo.class} className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-lg">{classInfo.class}</h4>
                <span className="text-sm text-muted-foreground">
                  {classInfo.studentCount} student{classInfo.studentCount !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Score</span>
                  <span className="font-medium">{classInfo.averageScore}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-cyan-600 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${(classInfo.averageScore / maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Engagement</span>
                  <span className="font-medium">{classInfo.averageEngagement}m</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${(classInfo.averageEngagement / maxEngagement) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p>Classes ordered by average assessment score (highest to lowest)</p>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-600 rounded"></div>
              <span>Assessment Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Engagement Time</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
