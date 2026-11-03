export type Category = 'Wi-Fi' | 'Hostel' | 'Classroom' | 'Laboratory'

export type Status = 'Raised' | 'In Progress' | 'Resolved'

export type FormulaMode = 'baseline' | 'enhanced'

export type TieBreakOrder = 'age-first' | 'category-first'

export interface StatusHistoryEntry {
  from: Status | null
  to: Status
  changedAt: number
}

export interface Complaint {
  id: string
  category: Category
  description: string
  status: Status
  submittedAt: number
  updatedAt: number
  history: StatusHistoryEntry[]
}

export interface ScoredComplaint extends Complaint {
  hoursPending: number
  categoryWeight: number
  ageScore: number
  bonusScore: number
  score: number
  heatRatio: number
  arithmeticText: string
  tieBreakSentence: string
  rank: number
}

export interface SummaryCounts {
  total: number
  pending: number
  raised: number
  inProgress: number
  resolved: number
}

export interface ValidationResult {
  isValid: boolean
  errors: {
    category?: string
    description?: string
    initialHoursAgo?: string
  }
}
