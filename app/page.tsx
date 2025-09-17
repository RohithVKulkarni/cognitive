"use client"

import { useState, useMemo } from "react"
import type { StudentData } from "@/types/student"
import { CSVUpload } from "@/components/csv-upload"
import { OverviewStatsComponent } from "@/components/overview-stats"
import { StudentTable } from "@/components/student-table"
import { ChartsDashboard } from "@/components/charts-dashboard"
import { MLInsights } from "@/components/ml-insights"
import { ReportGenerator } from "@/components/report-generator"
import { ExportManager } from "@/components/export-manager"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Users, TrendingUp, BarChart3, Upload, Table, PieChart, FileText, Download } from "lucide-react"
import { calculateOverviewStats, calculateCorrelations, getClassDistribution } from "@/lib/analytics"

export default function HomePage() {
  const [studentData, setStudentData] = useState<StudentData[]>([])

  const handleDataLoaded = (data: StudentData[]) => {
    setStudentData(data)
  }

  const handleReset = () => {
    setStudentData([])
  }

  const analytics = useMemo(() => {
    if (studentData.length === 0) return null

    return {
      stats: calculateOverviewStats(studentData),
      correlations: calculateCorrelations(studentData),
      classDistribution: getClassDistribution(studentData),
    }
  }, [studentData])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-balance">Cognitive Skills & Student Performance Dashboard</h1>
                <p className="text-muted-foreground">Analyze student cognitive data and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {studentData.length > 0 && (
                <Button variant="outline" onClick={handleReset} className="flex items-center gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Upload New Data
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {studentData.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <CSVUpload onDataLoaded={handleDataLoaded} />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Student Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    View detailed student performance data with searchable and sortable tables
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Data Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Interactive charts showing cognitive skills, correlations, and performance trends
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">ML Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Machine learning analysis with predictions and student clustering
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                ML Insights
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {analytics && (
                <OverviewStatsComponent
                  stats={analytics.stats}
                  correlations={analytics.correlations}
                  classDistribution={analytics.classDistribution}
                />
              )}
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <StudentTable data={studentData} />
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <ChartsDashboard data={studentData} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <MLInsights data={studentData} />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <ReportGenerator data={studentData} />
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <ExportManager data={studentData} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
