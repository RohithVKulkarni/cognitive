"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import type { StudentData } from "@/types/student"
import { trainLinearRegression, makePredictions, performClustering, generateInsights } from "@/lib/ml-analysis"

interface MLInsightsProps {
  data: StudentData[]
}

export function MLInsights({ data }: MLInsightsProps) {
  const analysis = useMemo(() => {
    if (data.length < 3) return null

    try {
      const model = trainLinearRegression(data)
      const predictions = makePredictions(data, model)
      const clusters = performClustering(data, 3)
      const insights = generateInsights(data, model, predictions, clusters)

      return { model, predictions, clusters, insights }
    } catch (error) {
      console.error("ML Analysis failed:", error)
      return null
    }
  }, [data])

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">Insufficient Data</p>
        <p className="text-muted-foreground">Need at least 3 students for ML analysis</p>
      </div>
    )
  }

  const { model, predictions, clusters, insights } = analysis

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600 bg-green-50"
    if (accuracy >= 80) return "text-blue-600 bg-blue-50"
    if (accuracy >= 70) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getPersonaColor = (persona: string) => {
    switch (persona) {
      case "High Achiever":
        return "bg-green-100 text-green-800"
      case "Balanced Learner":
        return "bg-blue-100 text-blue-800"
      case "Developing Student":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Generated Insights
          </CardTitle>
          <CardDescription>Machine learning analysis of student performance patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="model" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="model">Regression Model</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="clustering">Student Personas</TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Model Performance
                </CardTitle>
                <CardDescription>Linear regression model statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>R-squared (R²)</span>
                    <span className="font-medium">{(model.rSquared * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={model.rSquared * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Explains {(model.rSquared * 100).toFixed(1)}% of variance in assessment scores
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Mean Squared Error</span>
                    <span className="font-medium">{model.meanSquaredError.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>How each cognitive skill influences assessment scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries({
                    Comprehension: model.coefficients.comprehension,
                    Attention: model.coefficients.attention,
                    Focus: model.coefficients.focus,
                    Retention: model.coefficients.retention,
                  }).map(([skill, coeff]) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${coeff > 0 ? "text-green-600" : "text-red-600"}`}>
                          {coeff > 0 ? "+" : ""}
                          {coeff.toFixed(3)}
                        </span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${coeff > 0 ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(100, Math.abs(coeff) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Predictions
              </CardTitle>
              <CardDescription>Actual vs predicted assessment scores for all students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Actual Score</TableHead>
                      <TableHead>Predicted Score</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions
                      .sort((a, b) => b.accuracy - a.accuracy)
                      .map((prediction) => (
                        <TableRow key={prediction.student_id}>
                          <TableCell className="font-medium">{prediction.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{prediction.actualScore}%</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{prediction.predictedScore}%</Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-sm ${prediction.difference > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {prediction.difference > 0 ? "+" : ""}
                              {prediction.difference}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getAccuracyColor(prediction.accuracy)}>
                              {prediction.accuracy.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clustering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Learning Personas
              </CardTitle>
              <CardDescription>Students grouped by similar cognitive and performance patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Persona</TableHead>
                      <TableHead>Characteristics</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clusters
                      .sort((a, b) => a.persona.localeCompare(b.persona))
                      .map((cluster) => (
                        <TableRow key={cluster.student_id}>
                          <TableCell className="font-medium">{cluster.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{cluster.class}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPersonaColor(cluster.persona)}>{cluster.persona}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {cluster.characteristics.map((char, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
