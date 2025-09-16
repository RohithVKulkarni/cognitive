"use client"

import type { StudentData } from "@/types/student"
import { CognitiveSkillsChart } from "@/components/charts/cognitive-skills-chart"
import { AttentionScoreScatter } from "@/components/charts/attention-score-scatter"
import { StudentRadarChart } from "@/components/charts/student-radar-chart"
import { ClassPerformanceChart } from "@/components/charts/class-performance-chart"

interface ChartsDashboardProps {
  data: StudentData[]
}

export function ChartsDashboard({ data }: ChartsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CognitiveSkillsChart data={data} />
        <AttentionScoreScatter data={data} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentRadarChart data={data} />
        <ClassPerformanceChart data={data} />
      </div>
    </div>
  )
}
