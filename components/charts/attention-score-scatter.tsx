"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StudentData } from "@/types/student"
import { Target } from "lucide-react"

interface AttentionScoreScatterProps {
  data: StudentData[]
}

export function AttentionScoreScatter({ data }: AttentionScoreScatterProps) {
  console.log("[v0] AttentionScoreScatter received data:", data?.length || 0, "students")

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Attention vs Assessment Score
          </CardTitle>
          <CardDescription>Relationship between attention levels and assessment performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available for chart
          </div>
        </CardContent>
      </Card>
    )
  }

  const scatterData = data.map((student) => ({
    attention: Math.round(student.attention * 100),
    score: student.assessment_score,
    name: student.name,
    class: student.class,
  }))

  console.log("[v0] Scatter data calculated:", scatterData.slice(0, 3))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Attention vs Assessment Score
        </CardTitle>
        <CardDescription>Relationship between attention levels and assessment performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] border border-border rounded-lg p-4 bg-card">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-4">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-8 right-4 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 mr-4 mt-4 mb-8 h-[240px] relative">
            {scatterData.map((student, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 bg-amber-500 rounded-full hover:bg-amber-600 cursor-pointer transition-colors group"
                style={{
                  left: `${student.attention}%`,
                  bottom: `${student.score}%`,
                  transform: "translate(-50%, 50%)",
                }}
                title={`${student.name} (${student.class}): Attention ${student.attention}%, Score ${student.score}%`}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {student.name} ({student.class})<br />
                  Attention: {student.attention}%<br />
                  Score: {student.score}%
                </div>
              </div>
            ))}
          </div>

          {/* Axis labels */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-foreground">
            Attention Level (%)
          </div>
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-foreground">
            Assessment Score (%)
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
