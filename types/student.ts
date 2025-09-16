export interface StudentData {
  student_id: number
  name: string
  class: string
  comprehension: number
  attention: number
  focus: number
  retention: number
  assessment_score: number
  engagement_time: number
}

export interface OverviewStats {
  averageScore: number
  averageComprehension: number
  averageAttention: number
  averageFocus: number
  averageRetention: number
  averageEngagementTime: number
  totalStudents: number
}

export interface CorrelationData {
  skill: string
  correlation: number
}

export interface StudentPersona {
  student_id: number
  name: string
  persona: string
  cluster: number
}
