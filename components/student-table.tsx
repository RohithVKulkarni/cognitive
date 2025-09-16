"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Users } from "lucide-react"
import type { StudentData } from "@/types/student"

interface StudentTableProps {
  data: StudentData[]
}

type SortField = keyof StudentData
type SortDirection = "asc" | "desc"

export function StudentTable({ data }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Get unique classes for filter
  const uniqueClasses = useMemo(() => {
    const classes = [...new Set(data.map((student) => student.class))].sort()
    return classes
  }, [data])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toString().includes(searchTerm)

      const matchesClass = classFilter === "all" || student.class === classFilter

      return matchesSearch && matchesClass
    })

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle string sorting
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [data, searchTerm, classFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50"
    if (score >= 80) return "text-blue-600 bg-blue-50"
    if (score >= 70) return "text-yellow-600 bg-yellow-50"
    if (score >= 60) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getSkillLevel = (value: number) => {
    if (value >= 0.8) return { label: "Excellent", color: "bg-green-500" }
    if (value >= 0.6) return { label: "Good", color: "bg-blue-500" }
    if (value >= 0.4) return { label: "Fair", color: "bg-yellow-500" }
    if (value >= 0.2) return { label: "Poor", color: "bg-orange-500" }
    return { label: "Very Poor", color: "bg-red-500" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Performance Table
        </CardTitle>
        <CardDescription>Detailed view of all student data with search and sorting capabilities</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, class, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {uniqueClasses.map((className) => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedData.length} of {data.length} students
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("student_id")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    ID {getSortIcon("student_id")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Name {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("class")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Class {getSortIcon("class")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("assessment_score")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Score {getSortIcon("assessment_score")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("comprehension")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Comprehension {getSortIcon("comprehension")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("attention")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Attention {getSortIcon("attention")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("focus")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Focus {getSortIcon("focus")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("retention")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Retention {getSortIcon("retention")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("engagement_time")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Engagement {getSortIcon("engagement_time")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((student) => (
                <TableRow key={student.student_id}>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.class}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getScoreColor(student.assessment_score)}>{student.assessment_score}%</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSkillLevel(student.comprehension).color}`} />
                      <span className="text-sm">{(student.comprehension * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSkillLevel(student.attention).color}`} />
                      <span className="text-sm">{(student.attention * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSkillLevel(student.focus).color}`} />
                      <span className="text-sm">{(student.focus * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSkillLevel(student.retention).color}`} />
                      <span className="text-sm">{(student.retention * 100).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{student.engagement_time}m</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No students found matching your search criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
