import Papa from "papaparse"
import type { StudentData } from "@/types/student"

const COLUMN_MAPPINGS: Record<string, string[]> = {
  student_id: ["student_id", "studentid", "id", "student id", "Student ID", "ID"],
  name: ["name", "student_name", "studentname", "Name", "Student Name", "STUDENT_NAME"],
  class: ["class", "grade", "section", "Class", "Grade", "Section", "CLASS"],
  comprehension: ["comprehension", "Comprehension", "COMPREHENSION", "comp"],
  attention: ["attention", "Attention", "ATTENTION", "att"],
  focus: ["focus", "Focus", "FOCUS"],
  retention: ["retention", "Retention", "RETENTION", "ret"],
  assessment_score: [
    "assessment_score",
    "assessmentscore",
    "score",
    "test_score",
    "Assessment Score",
    "Score",
    "SCORE",
  ],
  engagement_time: [
    "engagement_time",
    "engagementtime",
    "time",
    "engagement",
    "Engagement Time",
    "Time",
    "ENGAGEMENT_TIME",
  ],
}

const normalizeColumnName = (columnName: string): string | null => {
  const trimmed = columnName.trim()
  for (const [standardName, variations] of Object.entries(COLUMN_MAPPINGS)) {
    if (variations.some((variation) => variation.toLowerCase() === trimmed.toLowerCase())) {
      return standardName
    }
  }
  return null
}

const createFieldMapping = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {}

  headers.forEach((header) => {
    const standardName = normalizeColumnName(header)
    if (standardName) {
      mapping[header] = standardName
    }
  })

  return mapping
}

export const parseCSV = (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error("CSV parsing failed: " + results.errors[0].message))
          return
        }

        const rawData = results.data as any[]
        if (rawData.length === 0) {
          reject(new Error("CSV file is empty"))
          return
        }

        const headers = Object.keys(rawData[0])
        const fieldMapping = createFieldMapping(headers)

        const requiredFields = Object.keys(COLUMN_MAPPINGS)
        const mappedFields = Object.values(fieldMapping)
        const missingFields = requiredFields.filter((field) => !mappedFields.includes(field))

        if (missingFields.length > 0) {
          reject(
            new Error(`Missing required columns: ${missingFields.join(", ")}. Found columns: ${headers.join(", ")}`),
          )
          return
        }

        const validData: StudentData[] = []
        const errors: string[] = []

        rawData.forEach((row, index) => {
          try {
            const transformedRow: any = {}

            // Map fields using the field mapping
            Object.entries(fieldMapping).forEach(([originalField, standardField]) => {
              const value = row[originalField]

              // Convert numeric fields
              if (
                [
                  "student_id",
                  "comprehension",
                  "attention",
                  "focus",
                  "retention",
                  "assessment_score",
                  "engagement_time",
                ].includes(standardField)
              ) {
                const numValue = Number.parseFloat(String(value).replace(/[^\d.-]/g, ""))
                if (isNaN(numValue)) {
                  throw new Error(`Invalid ${standardField}: "${value}" (should be a number)`)
                }
                transformedRow[standardField] = numValue
              } else {
                if (!value || String(value).trim() === "") {
                  throw new Error(`Missing ${standardField}`)
                }
                transformedRow[standardField] = String(value).trim()
              }
            })

            if (transformedRow.comprehension < 0 || transformedRow.comprehension > 1) {
              throw new Error(`Comprehension should be between 0.0 and 1.0, got ${transformedRow.comprehension}`)
            }
            if (transformedRow.attention < 0 || transformedRow.attention > 1) {
              throw new Error(`Attention should be between 0.0 and 1.0, got ${transformedRow.attention}`)
            }
            if (transformedRow.focus < 0 || transformedRow.focus > 1) {
              throw new Error(`Focus should be between 0.0 and 1.0, got ${transformedRow.focus}`)
            }
            if (transformedRow.retention < 0 || transformedRow.retention > 1) {
              throw new Error(`Retention should be between 0.0 and 1.0, got ${transformedRow.retention}`)
            }
            if (transformedRow.assessment_score < 0 || transformedRow.assessment_score > 100) {
              throw new Error(`Assessment score should be between 0 and 100, got ${transformedRow.assessment_score}`)
            }

            validData.push(transformedRow as StudentData)
          } catch (error) {
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Invalid data"}`)
          }
        })

        if (validData.length === 0) {
          reject(
            new Error(
              `No valid data found. Errors:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ""}`,
            ),
          )
          return
        }

        if (errors.length > 0 && errors.length < rawData.length / 2) {
          console.warn(
            `Some rows had errors and were skipped:\n${errors.slice(0, 3).join("\n")}${errors.length > 3 ? `\n... and ${errors.length - 3} more` : ""}`,
          )
        }

        resolve(validData)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

export const validateCSVStructure = (data: any[]): boolean => {
  if (!data || data.length === 0) return false

  const requiredFields = [
    "student_id",
    "name",
    "class",
    "comprehension",
    "attention",
    "focus",
    "retention",
    "assessment_score",
    "engagement_time",
  ]

  const firstRow = data[0]
  return requiredFields.every((field) => field in firstRow)
}
