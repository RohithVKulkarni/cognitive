"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Brain, Clock, TrendingUp, Award } from "lucide-react"
import type { OverviewStats, CorrelationData } from "@/types/student"

interface OverviewStatsProps {
  stats: OverviewStats
  correlations: CorrelationData[]
  classDistribution: Array<{ class: string; count: number; percentage: number }>
}

export function OverviewStatsComponent({ stats, correlations, classDistribution }: OverviewStatsProps) {
  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.7) return "text-green-600"
    if (abs >= 0.5) return "text-yellow-600"
    if (abs >= 0.3) return "text-orange-600"
    return "text-red-600"
  }

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.7) return "Strong"
    if (abs >= 0.5) return "Moderate"
    if (abs >= 0.3) return "Weak"
    return "Very Weak"
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <Progress value={stats.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageEngagementTime}m</div>
            <p className="text-xs text-muted-foreground">Time per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skill</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(
                stats.averageComprehension,
                stats.averageAttention,
                stats.averageFocus,
                stats.averageRetention,
              ) === stats.averageComprehension
                ? "Comprehension"
                : Math.max(stats.averageAttention, stats.averageFocus, stats.averageRetention) ===
                    stats.averageAttention
                  ? "Attention"
                  : Math.max(stats.averageFocus, stats.averageRetention) === stats.averageFocus
                    ? "Focus"
                    : "Retention"}
            </div>
            <p className="text-xs text-muted-foreground">Strongest cognitive skill</p>
          </CardContent>
        </Card>
      </div>

      {/* Cognitive Skills Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Cognitive Skills Overview
          </CardTitle>
          <CardDescription>Average performance across all cognitive dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Comprehension</span>
                <span className="font-medium">{(stats.averageComprehension * 100).toFixed(1)}%</span>
              </div>
              <Progress value={stats.averageComprehension * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attention</span>
                <span className="font-medium">{(stats.averageAttention * 100).toFixed(1)}%</span>
              </div>
              <Progress value={stats.averageAttention * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Focus</span>
                <span className="font-medium">{(stats.averageFocus * 100).toFixed(1)}%</span>
              </div>
              <Progress value={stats.averageFocus * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Retention</span>
                <span className="font-medium">{(stats.averageRetention * 100).toFixed(1)}%</span>
              </div>
              <Progress value={stats.averageRetention * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correlations and Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Skill-Performance Correlations
            </CardTitle>
            <CardDescription>How cognitive skills relate to assessment scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {correlations.map((corr) => (
                <div key={corr.skill} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{corr.skill}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getCorrelationColor(corr.correlation)}>
                      {getCorrelationStrength(corr.correlation)}
                    </Badge>
                    <span className={`text-sm font-mono ${getCorrelationColor(corr.correlation)}`}>
                      {corr.correlation > 0 ? "+" : ""}
                      {corr.correlation.toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
            <CardDescription>Student distribution across classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classDistribution.map((item) => (
                <div key={item.class} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.class}</span>
                    <span className="text-muted-foreground">
                      {item.count} students ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
