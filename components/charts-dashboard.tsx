"use client"

import type { StudentData } from "@/types/student"
import { CognitiveSkillsChart } from "@/components/charts/cognitive-skills-chart"
import { AttentionScoreScatter } from "@/components/charts/attention-score-scatter"
import { StudentRadarChart } from "@/components/charts/student-radar-chart"
import { ClassPerformanceChart } from "@/components/charts/class-performance-chart"
import { PerformanceHeatmap } from "@/components/charts/performance-heatmap"
import { AnimatedPerformanceChart } from "@/components/charts/animated-performance-chart"
import { ThreeDPerformanceScatter } from "@/components/charts/3d-performance-scatter"

interface ChartsDashboardProps {
  data: StudentData[]
}

export function ChartsDashboard({ data }: ChartsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Enhanced Visualizations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Enhanced Visualizations</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ThreeDPerformanceScatter data={data} />
          <PerformanceHeatmap data={data} />
        </div>
        <AnimatedPerformanceChart data={data} />
      </div>

      {/* Standard Charts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Standard Charts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CognitiveSkillsChart data={data} />
          <AttentionScoreScatter data={data} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentRadarChart data={data} />
          <ClassPerformanceChart data={data} />
        </div>
      </div>
    </div>
  )
}
