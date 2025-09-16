import type { StudentData, OverviewStats, CorrelationData } from "@/types/student"

export const calculateOverviewStats = (data: StudentData[]): OverviewStats => {
  if (data.length === 0) {
    return {
      averageScore: 0,
      averageComprehension: 0,
      averageAttention: 0,
      averageFocus: 0,
      averageRetention: 0,
      averageEngagementTime: 0,
      totalStudents: 0,
    }
  }

  const totals = data.reduce(
    (acc, student) => ({
      score: acc.score + student.assessment_score,
      comprehension: acc.comprehension + student.comprehension,
      attention: acc.attention + student.attention,
      focus: acc.focus + student.focus,
      retention: acc.retention + student.retention,
      engagementTime: acc.engagementTime + student.engagement_time,
    }),
    {
      score: 0,
      comprehension: 0,
      attention: 0,
      focus: 0,
      retention: 0,
      engagementTime: 0,
    },
  )

  const count = data.length

  return {
    averageScore: Math.round((totals.score / count) * 100) / 100,
    averageComprehension: Math.round((totals.comprehension / count) * 100) / 100,
    averageAttention: Math.round((totals.attention / count) * 100) / 100,
    averageFocus: Math.round((totals.focus / count) * 100) / 100,
    averageRetention: Math.round((totals.retention / count) * 100) / 100,
    averageEngagementTime: Math.round((totals.engagementTime / count) * 100) / 100,
    totalStudents: count,
  }
}

export const calculateCorrelations = (data: StudentData[]): CorrelationData[] => {
  if (data.length < 2) return []

  const skills = ["comprehension", "attention", "focus", "retention"] as const

  return skills.map((skill) => {
    const correlation = calculatePearsonCorrelation(
      data.map((d) => d[skill]),
      data.map((d) => d.assessment_score),
    )

    return {
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      correlation: Math.round(correlation * 1000) / 1000,
    }
  })
}

const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length
  if (n === 0) return 0

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  return denominator === 0 ? 0 : numerator / denominator
}

export const getClassDistribution = (data: StudentData[]) => {
  const distribution = data.reduce(
    (acc, student) => {
      acc[student.class] = (acc[student.class] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(distribution).map(([className, count]) => ({
    class: className,
    count,
    percentage: Math.round((count / data.length) * 100),
  }))
}
