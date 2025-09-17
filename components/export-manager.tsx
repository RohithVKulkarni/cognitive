"use client"

import { useState } from "react"
import type { StudentData } from "@/types/student"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Download, FileSpreadsheet, FileText, Database, Filter } from "lucide-react"

interface ExportManagerProps {
  data: StudentData[]
}

interface ExportConfig {
  format: "csv" | "excel" | "json"
  includeFields: string[]
  filterBy: {
    class: string[]
    performanceLevel: string[]
    minScore: number
    maxScore: number
  }
  sortBy: string
  sortOrder: "asc" | "desc"
}

export function ExportManager({ data }: ExportManagerProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: "csv",
    includeFields: [
      "name",
      "class",
      "comprehension",
      "attention",
      "focus",
      "retention",
      "assessment_score",
      "engagement_time",
    ],
    filterBy: {
      class: [],
      performanceLevel: [],
      minScore: 0,
      maxScore: 100,
    },
    sortBy: "name",
    sortOrder: "asc",
  })

  const availableFields = [
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "class", label: "Class" },
    { key: "comprehension", label: "Comprehension" },
    { key: "attention", label: "Attention" },
    { key: "focus", label: "Focus" },
    { key: "retention", label: "Retention" },
    { key: "assessment_score", label: "Assessment Score" },
    { key: "engagement_time", label: "Engagement Time" },
  ]

  const classes = [...new Set(data.map((s) => s.class))]
  const performanceLevels = ["Excellent", "Good", "Average", "Needs Improvement"]

  const getPerformanceLevel = (student: StudentData) => {
    const avgCognitive = (student.comprehension + student.attention + student.focus + student.retention) / 4
    if (avgCognitive >= 0.8) return "Excellent"
    if (avgCognitive >= 0.6) return "Good"
    if (avgCognitive >= 0.4) return "Average"
    return "Needs Improvement"
  }

  const getFilteredData = () => {
    let filtered = [...data]

    // Apply class filter
    if (config.filterBy.class.length > 0) {
      filtered = filtered.filter((s) => config.filterBy.class.includes(s.class))
    }

    // Apply performance level filter
    if (config.filterBy.performanceLevel.length > 0) {
      filtered = filtered.filter((s) => config.filterBy.performanceLevel.includes(getPerformanceLevel(s)))
    }

    // Apply score range filter
    filtered = filtered.filter(
      (s) => s.assessment_score >= config.filterBy.minScore && s.assessment_score <= config.filterBy.maxScore,
    )

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[config.sortBy as keyof StudentData]
      const bValue = b[config.sortBy as keyof StudentData]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return config.sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return config.sortOrder === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }

  const prepareExportData = () => {
    const filteredData = getFilteredData()

    return filteredData.map((student) => {
      const exportRow: any = {}

      config.includeFields.forEach((field) => {
        if (field === "comprehension" || field === "attention" || field === "focus" || field === "retention") {
          exportRow[field] = ((student[field as keyof StudentData] as number) * 100).toFixed(1) + "%"
        } else {
          exportRow[field] = student[field as keyof StudentData]
        }
      })

      // Add calculated fields if requested
      if (config.includeFields.includes("performance_level")) {
        exportRow.performance_level = getPerformanceLevel(student)
      }

      if (config.includeFields.includes("overall_cognitive")) {
        const overall = (student.comprehension + student.attention + student.focus + student.retention) / 4
        exportRow.overall_cognitive = (overall * 100).toFixed(1) + "%"
      }

      return exportRow
    })
  }

  const exportToCSV = () => {
    const exportData = prepareExportData()
    if (exportData.length === 0) return

    const headers = config.includeFields.map((field) => availableFields.find((f) => f.key === field)?.label || field)

    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        config.includeFields
          .map((field) => {
            const value = row[field]
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `student_performance_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = () => {
    const exportData = prepareExportData()
    if (exportData.length === 0) return

    // Create a simple HTML table that Excel can import
    const headers = config.includeFields.map((field) => availableFields.find((f) => f.key === field)?.label || field)

    const htmlContent = `
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${exportData
            .map((row) => `<tr>${config.includeFields.map((field) => `<td>${row[field] || ""}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    `

    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `student_performance_${new Date().toISOString().split("T")[0]}.xls`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    const exportData = prepareExportData()
    if (exportData.length === 0) return

    const jsonContent = JSON.stringify(
      {
        metadata: {
          exportDate: new Date().toISOString(),
          totalRecords: exportData.length,
          filters: config.filterBy,
          fields: config.includeFields,
        },
        data: exportData,
      },
      null,
      2,
    )

    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `student_performance_${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = () => {
    switch (config.format) {
      case "csv":
        exportToCSV()
        break
      case "excel":
        exportToExcel()
        break
      case "json":
        exportToJSON()
        break
    }
  }

  const handleFieldToggle = (field: string, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      includeFields: checked ? [...prev.includeFields, field] : prev.includeFields.filter((f) => f !== field),
    }))
  }

  const handleClassFilter = (className: string, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      filterBy: {
        ...prev.filterBy,
        class: checked ? [...prev.filterBy.class, className] : prev.filterBy.class.filter((c) => c !== className),
      },
    }))
  }

  const handlePerformanceFilter = (level: string, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      filterBy: {
        ...prev.filterBy,
        performanceLevel: checked
          ? [...prev.filterBy.performanceLevel, level]
          : prev.filterBy.performanceLevel.filter((l) => l !== level),
      },
    }))
  }

  const filteredCount = getFilteredData().length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Data Export Manager
        </CardTitle>
        <CardDescription>
          Export student performance data in various formats with custom filtering and field selection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format Selection */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Export Format</Label>
          <div className="flex gap-3">
            <Button
              variant={config.format === "csv" ? "default" : "outline"}
              onClick={() => setConfig((prev) => ({ ...prev, format: "csv" }))}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant={config.format === "excel" ? "default" : "outline"}
              onClick={() => setConfig((prev) => ({ ...prev, format: "excel" }))}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              variant={config.format === "json" ? "default" : "outline"}
              onClick={() => setConfig((prev) => ({ ...prev, format: "json" }))}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Field Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Include Fields</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableFields.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={config.includeFields.includes(field.key)}
                  onCheckedChange={(checked) => handleFieldToggle(field.key, !!checked)}
                />
                <Label htmlFor={field.key} className="text-sm">
                  {field.label}
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="performance_level"
                checked={config.includeFields.includes("performance_level")}
                onCheckedChange={(checked) => handleFieldToggle("performance_level", !!checked)}
              />
              <Label htmlFor="performance_level" className="text-sm">
                Performance Level
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overall_cognitive"
                checked={config.includeFields.includes("overall_cognitive")}
                onCheckedChange={(checked) => handleFieldToggle("overall_cognitive", !!checked)}
              />
              <Label htmlFor="overall_cognitive" className="text-sm">
                Overall Cognitive
              </Label>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Label>

          {/* Class Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Classes</Label>
            <div className="flex flex-wrap gap-2">
              {classes.map((className) => (
                <div key={className} className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-${className}`}
                    checked={config.filterBy.class.includes(className)}
                    onCheckedChange={(checked) => handleClassFilter(className, !!checked)}
                  />
                  <Label htmlFor={`class-${className}`} className="text-sm">
                    {className}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Level Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Performance Levels</Label>
            <div className="flex flex-wrap gap-2">
              {performanceLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`perf-${level}`}
                    checked={config.filterBy.performanceLevel.includes(level)}
                    onCheckedChange={(checked) => handlePerformanceFilter(level, !!checked)}
                  />
                  <Label htmlFor={`perf-${level}`} className="text-sm">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Score Range Filter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minScore" className="text-sm font-medium">
                Min Score
              </Label>
              <Input
                id="minScore"
                type="number"
                min="0"
                max="100"
                value={config.filterBy.minScore}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    filterBy: { ...prev.filterBy, minScore: Number.parseInt(e.target.value) || 0 },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxScore" className="text-sm font-medium">
                Max Score
              </Label>
              <Input
                id="maxScore"
                type="number"
                min="0"
                max="100"
                value={config.filterBy.maxScore}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    filterBy: { ...prev.filterBy, maxScore: Number.parseInt(e.target.value) || 100 },
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Sorting */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sortBy" className="text-sm font-medium">
              Sort By
            </Label>
            <Select value={config.sortBy} onValueChange={(value) => setConfig((prev) => ({ ...prev, sortBy: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field.key} value={field.key}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder" className="text-sm font-medium">
              Sort Order
            </Label>
            <Select
              value={config.sortOrder}
              onValueChange={(value: any) => setConfig((prev) => ({ ...prev, sortOrder: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export Summary</p>
              <p className="text-sm text-muted-foreground">
                {filteredCount} of {data.length} students • {config.includeFields.length} fields •{" "}
                {config.format.toUpperCase()} format
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={config.includeFields.length === 0 || filteredCount === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
