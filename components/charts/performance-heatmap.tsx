"use client"

import { useMemo } from "react"
import type { StudentData } from "@/types/student"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PerformanceHeatmapProps {
  data: StudentData[]
}

export function PerformanceHeatmap({ data }: PerformanceHeatmapProps) {
  const heatmapData = useMemo(() => {
    const skills = ["comprehension", "attention", "focus", "retention"] as const
    const correlationMatrix: number[][] = []

    // Calculate correlation matrix
    for (let i = 0; i < skills.length; i++) {
      correlationMatrix[i] = []
      for (let j = 0; j < skills.length; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1
        } else {
          // Calculate Pearson correlation coefficient
          const skill1Values = data.map((student) => student[skills[i]])
          const skill2Values = data.map((student) => student[skills[j]])

          const mean1 = skill1Values.reduce((a, b) => a + b, 0) / skill1Values.length
          const mean2 = skill2Values.reduce((a, b) => a + b, 0) / skill2Values.length

          const numerator = skill1Values.reduce((sum, val, idx) => sum + (val - mean1) * (skill2Values[idx] - mean2), 0)

          const denominator = Math.sqrt(
            skill1Values.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
              skill2Values.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0),
          )

          correlationMatrix[i][j] = denominator === 0 ? 0 : numerator / denominator
        }
      }
    }

    return { skills, correlationMatrix }
  }, [data])

  const getHeatmapColor = (value: number) => {
    // Convert correlation value (-1 to 1) to color intensity
    const intensity = Math.abs(value)
    const hue = value >= 0 ? 120 : 0 // Green for positive, red for negative
    return `hsl(${hue}, 70%, ${85 - intensity * 35}%)`
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Cognitive Skills Correlation Heatmap</CardTitle>
        <CardDescription>Correlation matrix showing relationships between cognitive skills</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {/* Header row */}
          <div></div>
          {heatmapData.skills.map((skill) => (
            <div key={skill} className="text-xs font-medium text-center p-2 capitalize">
              {skill.slice(0, 4)}
            </div>
          ))}

          {/* Data rows */}
          {heatmapData.skills.map((rowSkill, i) => (
            <div key={rowSkill} className="contents">
              <div className="text-xs font-medium p-2 capitalize text-right">{rowSkill.slice(0, 4)}</div>
              {heatmapData.correlationMatrix[i].map((value, j) => (
                <div
                  key={j}
                  className="aspect-square flex items-center justify-center text-xs font-medium rounded transition-all duration-200 hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: getHeatmapColor(value) }}
                  title={`${heatmapData.skills[i]} vs ${heatmapData.skills[j]}: ${value.toFixed(3)}`}
                >
                  {value.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(120, 70%, 50%)" }}></div>
            <span>Strong Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(120, 70%, 85%)" }}></div>
            <span>Weak Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(0, 70%, 85%)" }}></div>
            <span>Weak Negative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(0, 70%, 50%)" }}></div>
            <span>Strong Negative</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
