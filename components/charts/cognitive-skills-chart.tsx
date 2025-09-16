"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StudentData } from "@/types/student"
import { Brain } from "lucide-react"

interface CognitiveSkillsChartProps {
  data: StudentData[]
}

export function CognitiveSkillsChart({ data }: CognitiveSkillsChartProps) {
  console.log("[v0] CognitiveSkillsChart received data:", data?.length || 0, "students")

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Cognitive Skills vs Assessment Performance
          </CardTitle>
          <CardDescription>Average cognitive skill levels compared to overall assessment scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available for chart
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    {
      skill: "Comprehension",
      averageSkill: Math.round((data.reduce((sum, student) => sum + student.comprehension, 0) / data.length) * 100),
      averageScore: Math.round(data.reduce((sum, student) => sum + student.assessment_score, 0) / data.length),
    },
    {
      skill: "Attention",
      averageSkill: Math.round((data.reduce((sum, student) => sum + student.attention, 0) / data.length) * 100),
      averageScore: Math.round(data.reduce((sum, student) => sum + student.assessment_score, 0) / data.length),
    },
    {
      skill: "Focus",
      averageSkill: Math.round((data.reduce((sum, student) => sum + student.focus, 0) / data.length) * 100),
      averageScore: Math.round(data.reduce((sum, student) => sum + student.assessment_score, 0) / data.length),
    },
    {
      skill: "Retention",
      averageSkill: Math.round((data.reduce((sum, student) => sum + student.retention, 0) / data.length) * 100),
      averageScore: Math.round(data.reduce((sum, student) => sum + student.assessment_score, 0) / data.length),
    },
  ]

  console.log("[v0] Chart data calculated:", chartData)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Cognitive Skills vs Assessment Performance
        </CardTitle>
        <CardDescription>Average cognitive skill levels compared to overall assessment scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {chartData.map((item) => (
            <div key={item.skill} className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{item.skill}</span>
                <span>
                  Skill: {item.averageSkill}% | Score: {item.averageScore}%
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Avg Skill Level</div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${item.averageSkill}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Avg Assessment Score</div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-cyan-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${item.averageScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
