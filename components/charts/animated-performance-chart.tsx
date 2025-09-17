"use client"

import { useState, useEffect, useMemo } from "react"
import type { StudentData } from "@/types/student"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface AnimatedPerformanceChartProps {
  data: StudentData[]
}

export function AnimatedPerformanceChart({ data }: AnimatedPerformanceChartProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [selectedMetric, setSelectedMetric] = useState<"comprehension" | "attention" | "focus" | "retention">(
    "comprehension",
  )

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a[selectedMetric] - b[selectedMetric])
  }, [data, selectedMetric])

  const maxFrames = sortedData.length

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentFrame < maxFrames - 1) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => prev + 1)
      }, 200)
    } else if (currentFrame >= maxFrames - 1) {
      setIsPlaying(false)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentFrame, maxFrames])

  const handlePlay = () => {
    if (currentFrame >= maxFrames - 1) {
      setCurrentFrame(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentFrame(0)
    setIsPlaying(false)
  }

  const visibleData = sortedData.slice(0, currentFrame + 1)
  const maxScore = Math.max(...data.map((s) => s.assessment_score))

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Animated Performance Progression</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePlay} className="flex items-center gap-1 bg-transparent">
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1 bg-transparent"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Watch students appear in order of {selectedMetric} performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 flex-wrap">
          {(["comprehension", "attention", "focus", "retention"] as const).map((metric) => (
            <Button
              key={metric}
              variant={selectedMetric === metric ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedMetric(metric)
                setCurrentFrame(0)
                setIsPlaying(false)
              }}
              className="capitalize"
            >
              {metric}
            </Button>
          ))}
        </div>

        <div className="relative h-80 bg-muted/20 rounded-lg p-4 overflow-hidden">
          {/* Y-axis */}
          <div className="absolute left-0 top-4 bottom-4 w-8 flex flex-col justify-between text-xs text-muted-foreground">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* X-axis */}
          <div className="absolute bottom-0 left-8 right-4 h-8 flex items-end justify-between text-xs text-muted-foreground">
            <span>0.0</span>
            <span>0.25</span>
            <span>0.5</span>
            <span>0.75</span>
            <span>1.0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-8 right-4 top-4 bottom-8">
            {[0, 25, 50, 75, 100].map((y) => (
              <div key={y} className="absolute w-full border-t border-border/30" style={{ bottom: `${y}%` }} />
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((x) => (
              <div key={x} className="absolute h-full border-l border-border/30" style={{ left: `${x * 100}%` }} />
            ))}
          </div>

          {/* Data points */}
          <div className="absolute left-8 right-4 top-4 bottom-8">
            {visibleData.map((student, index) => (
              <div
                key={student.student_id}
                className="absolute w-3 h-3 rounded-full bg-primary transition-all duration-500 hover:scale-150 cursor-pointer animate-in fade-in zoom-in"
                style={{
                  left: `${student[selectedMetric] * 100}%`,
                  bottom: `${(student.assessment_score / maxScore) * 100}%`,
                  transform: "translate(-50%, 50%)",
                  animationDelay: `${index * 50}ms`,
                }}
                title={`${student.name}: ${selectedMetric} ${(student[selectedMetric] * 100).toFixed(1)}%, Score: ${student.assessment_score}%`}
              />
            ))}
          </div>

          {/* Progress indicator */}
          <div className="absolute top-2 right-2 text-sm text-muted-foreground">
            {currentFrame + 1} / {maxFrames} students
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          X-axis: {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Level • Y-axis: Assessment Score
        </div>
      </CardContent>
    </Card>
  )
}
