import { DESCRIPTION_MAX, DESCRIPTION_MIN } from './config'
import type {
  Category,
  Complaint,
  Status,
  StatusHistoryEntry,
  SummaryCounts,
  ValidationResult,
} from './types'

const VALID_CATEGORIES: readonly Category[] = [
  'Wi-Fi',
  'Hostel',
  'Classroom',
  'Laboratory',
]

const VALID_STATUSES: readonly Status[] = ['Raised', 'In Progress', 'Resolved']

/**
 * Returns the next allowed status in the strict forward-only state machine:
 * 'Raised' -> 'In Progress' -> 'Resolved' -> null.
 */
export function getNextAllowedStatus(current: Status): Status | null {
  switch (current) {
    case 'Raised':
      return 'In Progress'
    case 'In Progress':
      return 'Resolved'
    case 'Resolved':
      return null
  }
}

/**
 * Advances a complaint forward by one status step.
 * Throws an Error if attempting to advance an already-Resolved complaint.
 */
export function advanceComplaintStatus(complaint: Complaint, nowMs: number): Complaint {
  const nextStatus = getNextAllowedStatus(complaint.status)
  if (nextStatus === null) {
    throw new Error(`Invalid status transition: cannot advance from '${complaint.status}'.`)
  }

  const historyEntry: StatusHistoryEntry = {
    from: complaint.status,
    to: nextStatus,
    changedAt: nowMs,
  }

  return {
    ...complaint,
    status: nextStatus,
    updatedAt: nowMs,
    history: [...complaint.history, historyEntry],
  }
}

/**
 * Finds the highest numeric suffix in existing complaints and returns
 * the next collision-safe ID formatted as 'C' + number (at least 2 digits, e.g. C05, C100).
 */
export function generateNextId(complaints: Complaint[]): string {
  let maxNum = 0

  for (const c of complaints) {
    const match = c.id.match(/^C(\d+)$/i)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) {
        maxNum = num
      }
    }
  }

  const nextNum = maxNum + 1
  return `C${nextNum.toString().padStart(2, '0')}`
}

/**
 * Validates complaint input fields with exact user-facing feedback messages.
 */
export function validateComplaintInput(
  category: string,
  description: string,
  initialHoursAgo = 0
): ValidationResult {
  const errors: { category?: string; description?: string; initialHoursAgo?: string } = {}

  if (!category || !VALID_CATEGORIES.includes(category as Category)) {
    errors.category = 'Choose a category.'
  }

  const trimmedDesc = description.trim()
  if (trimmedDesc.length < DESCRIPTION_MIN) {
    errors.description = 'Describe the problem in at least 10 characters.'
  } else if (trimmedDesc.length > DESCRIPTION_MAX) {
    errors.description = 'Keep it under 280 characters.'
  }

  if (typeof initialHoursAgo !== 'number' || Number.isNaN(initialHoursAgo) || initialHoursAgo < 0) {
    errors.initialHoursAgo = 'Initial hours cannot be negative.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Deep runtime shape validator for complaint records to prevent bad JSON
 * or corrupt localStorage entries from crashing the application.
 */
export function isValidComplaintRecord(obj: unknown): obj is Complaint {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const candidate = obj as Record<string, unknown>

  // ID must be string matching C + digits
  if (typeof candidate.id !== 'string' || !/^C\d+$/.test(candidate.id)) {
    return false
  }

  // Category must be one of the 4 defined categories
  if (!VALID_CATEGORIES.includes(candidate.category as Category)) {
    return false
  }

  // Status must be one of the 3 defined statuses
  if (!VALID_STATUSES.includes(candidate.status as Status)) {
    return false
  }

  // Description must be string with valid length
  if (
    typeof candidate.description !== 'string' ||
    candidate.description.trim().length < DESCRIPTION_MIN ||
    candidate.description.trim().length > DESCRIPTION_MAX
  ) {
    return false
  }

  // Timestamps must be finite numbers
  if (
    typeof candidate.submittedAt !== 'number' ||
    !Number.isFinite(candidate.submittedAt) ||
    candidate.submittedAt <= 0
  ) {
    return false
  }

  if (
    typeof candidate.updatedAt !== 'number' ||
    !Number.isFinite(candidate.updatedAt) ||
    candidate.updatedAt < candidate.submittedAt
  ) {
    return false
  }

  // History must be an array of valid status history entries
  if (!Array.isArray(candidate.history)) {
    return false
  }

  for (const entry of candidate.history) {
    if (typeof entry !== 'object' || entry === null) {
      return false
    }
    const e = entry as Record<string, unknown>

    if (e.from !== null && !VALID_STATUSES.includes(e.from as Status)) {
      return false
    }

    if (!VALID_STATUSES.includes(e.to as Status)) {
      return false
    }

    if (typeof e.changedAt !== 'number' || !Number.isFinite(e.changedAt) || e.changedAt < 0) {
      return false
    }
  }

  return true
}

/**
 * Computes live summary telemetry counts: Total, Pending (Raised + In Progress),
 * Raised, In Progress, and Resolved.
 */
export function computeSummaryCounts(complaints: Complaint[]): SummaryCounts {
  let raised = 0
  let inProgress = 0
  let resolved = 0

  for (const c of complaints) {
    switch (c.status) {
      case 'Raised':
        raised++
        break
      case 'In Progress':
        inProgress++
        break
      case 'Resolved':
        resolved++
        break
    }
  }

  return {
    total: complaints.length,
    pending: raised + inProgress,
    raised,
    inProgress,
    resolved,
  }
}
