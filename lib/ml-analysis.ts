import type { StudentData } from "@/types/student"

export interface LinearRegressionModel {
  coefficients: {
    comprehension: number
    attention: number
    focus: number
    retention: number
    intercept: number
  }
  rSquared: number
  meanSquaredError: number
}

export interface PredictionResult {
  student_id: number
  name: string
  actualScore: number
  predictedScore: number
  difference: number
  accuracy: number
}

export interface ClusterResult {
  student_id: number
  name: string
  class: string
  cluster: number
  persona: string
  characteristics: string[]
}

// Simple linear regression implementation
export const trainLinearRegression = (data: StudentData[]): LinearRegressionModel => {
  const n = data.length
  if (n < 2) {
    throw new Error("Need at least 2 data points for regression")
  }

  // Prepare feature matrix X and target vector y
  const X = data.map((student) => [
    student.comprehension,
    student.attention,
    student.focus,
    student.retention,
    1, // intercept term
  ])
  const y = data.map((student) => student.assessment_score)

  // Simple multiple linear regression using normal equation: β = (X'X)^(-1)X'y
  // For simplicity, we'll use a basic implementation
  const means = {
    comprehension: data.reduce((sum, s) => sum + s.comprehension, 0) / n,
    attention: data.reduce((sum, s) => sum + s.attention, 0) / n,
    focus: data.reduce((sum, s) => sum + s.focus, 0) / n,
    retention: data.reduce((sum, s) => sum + s.retention, 0) / n,
    score: data.reduce((sum, s) => sum + s.assessment_score, 0) / n,
  }

  // Calculate coefficients using simplified approach
  let sumXY_comp = 0,
    sumXY_att = 0,
    sumXY_foc = 0,
    sumXY_ret = 0
  let sumXX_comp = 0,
    sumXX_att = 0,
    sumXX_foc = 0,
    sumXX_ret = 0

  data.forEach((student) => {
    const comp_dev = student.comprehension - means.comprehension
    const att_dev = student.attention - means.attention
    const foc_dev = student.focus - means.focus
    const ret_dev = student.retention - means.retention
    const score_dev = student.assessment_score - means.score

    sumXY_comp += comp_dev * score_dev
    sumXY_att += att_dev * score_dev
    sumXY_foc += foc_dev * score_dev
    sumXY_ret += ret_dev * score_dev

    sumXX_comp += comp_dev * comp_dev
    sumXX_att += att_dev * att_dev
    sumXX_foc += foc_dev * foc_dev
    sumXX_ret += ret_dev * ret_dev
  })

  // Simple coefficients calculation
  const coefficients = {
    comprehension: sumXX_comp > 0 ? sumXY_comp / sumXX_comp : 0,
    attention: sumXX_att > 0 ? sumXY_att / sumXX_att : 0,
    focus: sumXX_foc > 0 ? sumXY_foc / sumXX_foc : 0,
    retention: sumXX_ret > 0 ? sumXY_ret / sumXX_ret : 0,
    intercept: means.score,
  }

  // Calculate R-squared and MSE
  let totalSumSquares = 0
  let residualSumSquares = 0

  data.forEach((student) => {
    const predicted =
      coefficients.comprehension * student.comprehension +
      coefficients.attention * student.attention +
      coefficients.focus * student.focus +
      coefficients.retention * student.retention +
      coefficients.intercept

    const residual = student.assessment_score - predicted
    const totalDeviation = student.assessment_score - means.score

    residualSumSquares += residual * residual
    totalSumSquares += totalDeviation * totalDeviation
  })

  const rSquared = totalSumSquares > 0 ? 1 - residualSumSquares / totalSumSquares : 0
  const meanSquaredError = residualSumSquares / n

  return {
    coefficients,
    rSquared: Math.max(0, Math.min(1, rSquared)),
    meanSquaredError,
  }
}

export const makePredictions = (data: StudentData[], model: LinearRegressionModel): PredictionResult[] => {
  return data.map((student) => {
    const predictedScore =
      model.coefficients.comprehension * student.comprehension +
      model.coefficients.attention * student.attention +
      model.coefficients.focus * student.focus +
      model.coefficients.retention * student.retention +
      model.coefficients.intercept

    const clampedPrediction = Math.max(0, Math.min(100, predictedScore))
    const difference = student.assessment_score - clampedPrediction
    const accuracy = Math.max(0, 100 - Math.abs(difference))

    return {
      student_id: student.student_id,
      name: student.name,
      actualScore: student.assessment_score,
      predictedScore: Math.round(clampedPrediction * 100) / 100,
      difference: Math.round(difference * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
    }
  })
}

// Simple K-means clustering implementation
export const performClustering = (data: StudentData[], k = 3): ClusterResult[] => {
  if (data.length < k) {
    return data.map((student, index) => ({
      student_id: student.student_id,
      name: student.name,
      class: student.class,
      cluster: index,
      persona: "Unique Learner",
      characteristics: ["Individual learning pattern"],
    }))
  }

  // Normalize features for clustering
  const features = data.map((student) => [
    student.comprehension,
    student.attention,
    student.focus,
    student.retention,
    student.assessment_score / 100, // normalize to 0-1 range
    student.engagement_time / 100, // normalize roughly
  ])

  // Initialize centroids randomly
  const centroids = Array.from({ length: k }, () => features[Math.floor(Math.random() * features.length)].slice())

  let assignments = new Array(data.length).fill(0)
  let iterations = 0
  const maxIterations = 50

  // K-means iterations
  while (iterations < maxIterations) {
    const newAssignments = features.map((feature) => {
      let minDistance = Number.POSITIVE_INFINITY
      let closestCentroid = 0

      centroids.forEach((centroid, index) => {
        const distance = euclideanDistance(feature, centroid)
        if (distance < minDistance) {
          minDistance = distance
          closestCentroid = index
        }
      })

      return closestCentroid
    })

    // Check for convergence
    if (JSON.stringify(assignments) === JSON.stringify(newAssignments)) {
      break
    }

    assignments = newAssignments

    // Update centroids
    for (let i = 0; i < k; i++) {
      const clusterPoints = features.filter((_, index) => assignments[index] === i)
      if (clusterPoints.length > 0) {
        for (let j = 0; j < centroids[i].length; j++) {
          centroids[i][j] = clusterPoints.reduce((sum, point) => sum + point[j], 0) / clusterPoints.length
        }
      }
    }

    iterations++
  }

  // Define personas based on cluster characteristics
  const personas = ["High Achiever", "Balanced Learner", "Developing Student"]
  const personaDescriptions = [
    ["Strong across all cognitive skills", "High assessment scores", "Consistent engagement"],
    ["Moderate performance", "Balanced skill development", "Steady progress"],
    ["Areas for improvement identified", "Potential for growth", "May benefit from targeted support"],
  ]

  return data.map((student, index) => {
    const cluster = assignments[index]
    return {
      student_id: student.student_id,
      name: student.name,
      class: student.class,
      cluster,
      persona: personas[cluster] || "Unique Learner",
      characteristics: personaDescriptions[cluster] || ["Individual learning pattern"],
    }
  })
}

const euclideanDistance = (a: number[], b: number[]): number => {
  return Math.sqrt(a.reduce((sum, val, index) => sum + Math.pow(val - b[index], 2), 0))
}

export const generateInsights = (
  data: StudentData[],
  model: LinearRegressionModel,
  predictions: PredictionResult[],
  clusters: ClusterResult[],
): string[] => {
  const insights: string[] = []

  // Model performance insights
  const avgAccuracy = predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length
  insights.push(
    `The linear regression model achieves ${avgAccuracy.toFixed(1)}% average prediction accuracy with an R² of ${(
      model.rSquared * 100
    ).toFixed(1)}%.`,
  )

  // Feature importance insights
  const coeffs = model.coefficients
  const maxCoeff = Math.max(
    Math.abs(coeffs.comprehension),
    Math.abs(coeffs.attention),
    Math.abs(coeffs.focus),
    Math.abs(coeffs.retention),
  )

  const mostImportant = Object.entries({
    Comprehension: Math.abs(coeffs.comprehension),
    Attention: Math.abs(coeffs.attention),
    Focus: Math.abs(coeffs.focus),
    Retention: Math.abs(coeffs.retention),
  }).reduce((a, b) => (a[1] > b[1] ? a : b))[0]

  insights.push(`${mostImportant} appears to be the most influential cognitive skill for predicting assessment scores.`)

  // Clustering insights
  const clusterCounts = clusters.reduce(
    (acc, student) => {
      acc[student.persona] = (acc[student.persona] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const largestGroup = Object.entries(clusterCounts).reduce((a, b) => (a[1] > b[1] ? a : b))
  insights.push(
    `Student clustering reveals that ${largestGroup[1]} students (${((largestGroup[1] / data.length) * 100).toFixed(
      1,
    )}%) fall into the "${largestGroup[0]}" category.`,
  )

  // Performance insights
  const highPerformers = predictions.filter((p) => p.actualScore >= 85).length
  const lowPerformers = predictions.filter((p) => p.actualScore < 60).length

  if (highPerformers > 0) {
    insights.push(
      `${highPerformers} students (${((highPerformers / data.length) * 100).toFixed(
        1,
      )}%) are high performers with scores ≥85%.`,
    )
  }

  if (lowPerformers > 0) {
    insights.push(
      `${lowPerformers} students (${((lowPerformers / data.length) * 100).toFixed(
        1,
      )}%) may benefit from additional support with scores <60%.`,
    )
  }

  return insights
}
