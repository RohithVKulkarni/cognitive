"use client"

import { useState } from "react"
import type { StudentData } from "@/types/student"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Loader2 } from "lucide-react"

interface ReportGeneratorProps {
  data: StudentData[]
}

interface ReportConfig {
  title: string
  description: string
  includeOverview: boolean
  includeIndividualProfiles: boolean
  includeClassComparison: boolean
  includeRecommendations: boolean
  selectedStudents: number[]
  reportType: "summary" | "detailed" | "individual"
}

export function ReportGenerator({ data }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [config, setConfig] = useState<ReportConfig>({
    title: "Student Performance Report",
    description: "Comprehensive analysis of student cognitive performance and assessment results",
    includeOverview: true,
    includeIndividualProfiles: true,
    includeClassComparison: true,
    includeRecommendations: true,
    selectedStudents: data.map((s) => s.student_id),
    reportType: "summary",
  })

  const generatePDFContent = () => {
    const selectedData = data.filter((s) => config.selectedStudents.includes(s.student_id))

    // Calculate statistics
    const avgScores = {
      comprehension: selectedData.reduce((sum, s) => sum + s.comprehension, 0) / selectedData.length,
      attention: selectedData.reduce((sum, s) => sum + s.attention, 0) / selectedData.length,
      focus: selectedData.reduce((sum, s) => sum + s.focus, 0) / selectedData.length,
      retention: selectedData.reduce((sum, s) => sum + s.retention, 0) / selectedData.length,
      assessment: selectedData.reduce((sum, s) => sum + s.assessment_score, 0) / selectedData.length,
    }

    const classDistribution = selectedData.reduce(
      (acc, student) => {
        acc[student.class] = (acc[student.class] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      metadata: {
        title: config.title,
        description: config.description,
        generatedAt: new Date().toISOString(),
        studentCount: selectedData.length,
      },
      overview: config.includeOverview
        ? {
            totalStudents: selectedData.length,
            averageScores: avgScores,
            classDistribution,
            performanceInsights: generateInsights(selectedData),
          }
        : null,
      students: config.includeIndividualProfiles
        ? selectedData.map((student) => ({
            ...student,
            performanceLevel: getPerformanceLevel(student),
            recommendations: generateStudentRecommendations(student),
          }))
        : null,
      classComparison: config.includeClassComparison ? generateClassComparison(selectedData) : null,
      recommendations: config.includeRecommendations ? generateGeneralRecommendations(selectedData) : null,
    }
  }

  const getPerformanceLevel = (student: StudentData) => {
    const avgCognitive = (student.comprehension + student.attention + student.focus + student.retention) / 4
    if (avgCognitive >= 0.8) return "Excellent"
    if (avgCognitive >= 0.6) return "Good"
    if (avgCognitive >= 0.4) return "Average"
    return "Needs Improvement"
  }

  const generateInsights = (students: StudentData[]) => {
    const insights = []
    const avgAssessment = students.reduce((sum, s) => sum + s.assessment_score, 0) / students.length

    if (avgAssessment >= 80) {
      insights.push("Class shows strong overall performance with high assessment scores.")
    } else if (avgAssessment < 60) {
      insights.push("Class performance indicates need for additional support and intervention.")
    }

    const highAttention = students.filter((s) => s.attention >= 0.8).length
    if (highAttention / students.length > 0.7) {
      insights.push("Majority of students demonstrate excellent attention levels.")
    }

    return insights
  }

  const generateStudentRecommendations = (student: StudentData) => {
    const recommendations = []

    if (student.attention < 0.5) {
      recommendations.push("Consider implementing attention-building exercises and shorter task intervals.")
    }
    if (student.focus < 0.5) {
      recommendations.push("Recommend focus training activities and distraction-free learning environments.")
    }
    if (student.retention < 0.5) {
      recommendations.push("Implement spaced repetition techniques and memory enhancement strategies.")
    }
    if (student.comprehension < 0.5) {
      recommendations.push("Provide additional reading comprehension support and scaffolded learning materials.")
    }

    return recommendations
  }

  const generateClassComparison = (students: StudentData[]) => {
    const classes = [...new Set(students.map((s) => s.class))]
    return classes.map((className) => {
      const classStudents = students.filter((s) => s.class === className)
      return {
        class: className,
        studentCount: classStudents.length,
        averageScore: classStudents.reduce((sum, s) => sum + s.assessment_score, 0) / classStudents.length,
        averageCognitive:
          classStudents.reduce((sum, s) => sum + (s.comprehension + s.attention + s.focus + s.retention) / 4, 0) /
          classStudents.length,
      }
    })
  }

  const generateGeneralRecommendations = (students: StudentData[]) => {
    const recommendations = []
    const lowPerformers = students.filter((s) => s.assessment_score < 60).length

    if (lowPerformers > students.length * 0.3) {
      recommendations.push(
        "Consider implementing differentiated instruction strategies to support struggling students.",
      )
    }

    recommendations.push("Regular cognitive skills assessment can help track student progress over time.")
    recommendations.push("Implement targeted interventions based on individual cognitive profiles.")

    return recommendations
  }

  const handleGeneratePDF = async () => {
    setIsGenerating(true)

    try {
      const reportData = generatePDFContent()

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${reportData.metadata.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin: 30px 0; }
            .student-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
            .stat-item { background: #f5f5f5; padding: 10px; border-radius: 5px; }
            .recommendations { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .performance-excellent { color: #22c55e; font-weight: bold; }
            .performance-good { color: #3b82f6; font-weight: bold; }
            .performance-average { color: #f59e0b; font-weight: bold; }
            .performance-needs-improvement { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportData.metadata.title}</h1>
            <p>${reportData.metadata.description}</p>
            <p><strong>Generated:</strong> ${new Date(reportData.metadata.generatedAt).toLocaleDateString()}</p>
            <p><strong>Students Analyzed:</strong> ${reportData.metadata.studentCount}</p>
          </div>

          ${
            reportData.overview
              ? `
            <div class="section">
              <h2>Performance Overview</h2>
              <div class="stats-grid">
                <div class="stat-item">
                  <h4>Average Comprehension</h4>
                  <p>${(reportData.overview.averageScores.comprehension * 100).toFixed(1)}%</p>
                </div>
                <div class="stat-item">
                  <h4>Average Attention</h4>
                  <p>${(reportData.overview.averageScores.attention * 100).toFixed(1)}%</p>
                </div>
                <div class="stat-item">
                  <h4>Average Focus</h4>
                  <p>${(reportData.overview.averageScores.focus * 100).toFixed(1)}%</p>
                </div>
                <div class="stat-item">
                  <h4>Average Retention</h4>
                  <p>${(reportData.overview.averageScores.retention * 100).toFixed(1)}%</p>
                </div>
                <div class="stat-item">
                  <h4>Average Assessment Score</h4>
                  <p>${reportData.overview.averageScores.assessment.toFixed(1)}%</p>
                </div>
              </div>
              
              <h3>Key Insights</h3>
              <ul>
                ${reportData.overview.performanceInsights.map((insight) => `<li>${insight}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }

          ${
            reportData.classComparison
              ? `
            <div class="section">
              <h2>Class Comparison</h2>
              <table>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Students</th>
                    <th>Avg Assessment Score</th>
                    <th>Avg Cognitive Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.classComparison
                    .map(
                      (cls) => `
                    <tr>
                      <td>${cls.class}</td>
                      <td>${cls.studentCount}</td>
                      <td>${cls.averageScore.toFixed(1)}%</td>
                      <td>${(cls.averageCognitive * 100).toFixed(1)}%</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : ""
          }

          ${
            reportData.students
              ? `
            <div class="section">
              <h2>Individual Student Profiles</h2>
              ${reportData.students
                .map(
                  (student) => `
                <div class="student-card">
                  <h3>${student.name} (${student.class})</h3>
                  <p><strong>Performance Level:</strong> 
                    <span class="performance-${student.performanceLevel.toLowerCase().replace(" ", "-")}">${student.performanceLevel}</span>
                  </p>
                  <div class="stats-grid">
                    <div class="stat-item">
                      <strong>Comprehension:</strong> ${(student.comprehension * 100).toFixed(1)}%
                    </div>
                    <div class="stat-item">
                      <strong>Attention:</strong> ${(student.attention * 100).toFixed(1)}%
                    </div>
                    <div class="stat-item">
                      <strong>Focus:</strong> ${(student.focus * 100).toFixed(1)}%
                    </div>
                    <div class="stat-item">
                      <strong>Retention:</strong> ${(student.retention * 100).toFixed(1)}%
                    </div>
                    <div class="stat-item">
                      <strong>Assessment Score:</strong> ${student.assessment_score}%
                    </div>
                    <div class="stat-item">
                      <strong>Engagement Time:</strong> ${student.engagement_time} min
                    </div>
                  </div>
                  ${
                    student.recommendations.length > 0
                      ? `
                    <div class="recommendations">
                      <h4>Recommendations:</h4>
                      <ul>
                        ${student.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
                      </ul>
                    </div>
                  `
                      : ""
                  }
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }

          ${
            reportData.recommendations
              ? `
            <div class="section">
              <h2>General Recommendations</h2>
              <div class="recommendations">
                <ul>
                  ${reportData.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
                </ul>
              </div>
            </div>
          `
              : ""
          }
        </body>
        </html>
      `

      // Create and download PDF
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${config.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Note: For actual PDF generation, you would typically use a library like jsPDF or Puppeteer
      // This creates an HTML file that can be printed to PDF by the browser
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStudentSelection = (studentId: number, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      selectedStudents: checked
        ? [...prev.selectedStudents, studentId]
        : prev.selectedStudents.filter((id) => id !== studentId),
    }))
  }

  const selectAllStudents = () => {
    setConfig((prev) => ({
      ...prev,
      selectedStudents: data.map((s) => s.student_id),
    }))
  }

  const deselectAllStudents = () => {
    setConfig((prev) => ({
      ...prev,
      selectedStudents: [],
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Report Generator
        </CardTitle>
        <CardDescription>
          Generate comprehensive PDF reports with student performance analysis and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={config.reportType}
              onValueChange={(value: any) => setConfig((prev) => ({ ...prev, reportType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="individual">Individual Profiles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={config.description}
            onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Report Sections */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Include Sections</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overview"
                checked={config.includeOverview}
                onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, includeOverview: !!checked }))}
              />
              <Label htmlFor="overview">Performance Overview</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="profiles"
                checked={config.includeIndividualProfiles}
                onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, includeIndividualProfiles: !!checked }))}
              />
              <Label htmlFor="profiles">Individual Profiles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="comparison"
                checked={config.includeClassComparison}
                onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, includeClassComparison: !!checked }))}
              />
              <Label htmlFor="comparison">Class Comparison</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recommendations"
                checked={config.includeRecommendations}
                onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, includeRecommendations: !!checked }))}
              />
              <Label htmlFor="recommendations">Recommendations</Label>
            </div>
          </div>
        </div>

        {/* Student Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Select Students ({config.selectedStudents.length}/{data.length})
            </Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllStudents}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllStudents}>
                Deselect All
              </Button>
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
            {data.map((student) => (
              <div key={student.student_id} className="flex items-center space-x-2">
                <Checkbox
                  id={`student-${student.student_id}`}
                  checked={config.selectedStudents.includes(student.student_id)}
                  onCheckedChange={(checked) => handleStudentSelection(student.student_id, !!checked)}
                />
                <Label htmlFor={`student-${student.student_id}`} className="text-sm">
                  {student.name} ({student.class})
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating || config.selectedStudents.length === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate PDF Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
